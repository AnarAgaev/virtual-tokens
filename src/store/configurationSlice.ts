import {nanoid} from 'nanoid'
import {create, type StateCreator} from 'zustand'
import {devtools} from 'zustand/middleware'
import type {T_ConfigurationSlice, T_Modifications} from '@/types'
import type {
	T_BlackList,
	T_Characteristics,
	T_Combos,
	T_Filters,
	T_HardFilterSteps,
	T_Product,
	T_Products,
	T_Steps,
	T_StepsCount,
	T_Titles,
	T_Units,
} from '@/zod'

const store: StateCreator<T_ConfigurationSlice> = (set, get) => ({
	steps: null,
	setSteps: (payload: T_Steps) => set({steps: payload}),

	stepsCount: null,
	setStepsCount: (payload: T_StepsCount) => set({stepsCount: payload}),

	hardFilterSteps: null,
	setHardFilterSteps: (payload: T_HardFilterSteps) =>
		set({hardFilterSteps: payload}),

	filters: null,
	setFilters: (payload: T_Filters) => set({filters: payload}),

	characteristics: null,
	setCharacteristics: (payload: T_Characteristics) =>
		set({characteristics: payload}),

	blacklist: null,
	setBlackList: (payload: T_BlackList) => set({blacklist: payload}),

	titles: null,
	setTitles: (payload: T_Titles) => set({titles: payload}),

	units: null,
	setUnits: (payload: T_Units) => set({units: payload}),

	combos: null,
	setCombos: (payload: T_Combos) => set({combos: payload}),

	products: null,
	setProducts: (payload: T_Products) => set({products: payload}),

	getProductByArticle: (article) => {
		if (!article) return null

		const products = get().products

		if (!products) return null

		return products[article]
	},

	createModifications: () => {
		const modifications: T_Modifications = {}

		const steps = get().steps
		if (!steps) return

		for (const stepName in steps) {
			const stepArticles = steps[stepName]
			if (!stepArticles) continue

			const filters = get().filters
			if (!filters) continue

			const selectorSections = filters[stepName]

			// Если в фильтрах нет текущего шага
			if (!selectorSections) {
				const selectorOptions = stepArticles.map(([code]) => {
					const product = code ? get().getProductByArticle(code) : null

					return {
						id: nanoid(),
						value: code ? 'Да' : 'Нет',
						products: product ? [product] : [],
						selected: !code,
					}
				})

				modifications[stepName] = [
					{
						selectorId: nanoid(),
						selectorName: stepName,
						selectorCode: null,
						selectorOptions,
					},
				]

				continue
			}

			modifications[stepName] = Object.entries(selectorSections).map(
				([code, name]) => {
					const key = code as keyof T_Product
					const products = stepArticles
						.flat()
						.map((a) => get().getProductByArticle(a ?? ''))
						.filter((p): p is T_Product => !!p)

					return {
						selectorId: nanoid(),
						selectorName: name,
						selectorCode: key,
						selectorOptions: [
							...new Set(products.map((p) => String(p[key] ?? ''))),
						]
							.filter(Boolean)
							.map((value) => ({
								id: nanoid(),
								value,
								selected: false,
								products: products.filter(
									(p) => String(p[key] ?? '') === value,
								),
							})),
					}
				},
			)
		}

		set({modifications})
	},

	getSelectorById: (payload) => {
		const modifications = get().modifications

		if (!modifications) return null

		const targetSelector = Object.values(modifications)
			.flat()
			.find((selector) => selector.selectorId === payload.selectorId)

		return targetSelector ?? null
	},

	getOptionById: (payload) => {
		const modifications = get().modifications

		if (!modifications) return null

		const targetOption = Object.values(modifications)
			.flat()
			.flatMap((selector) => selector.selectorOptions)
			.find((option) => option.id === payload.optionId)

		return targetOption ?? null
	},

	shouldBlockOption: (payload) => {
		const {blockedArticles, maybeBlocked, blacklists} = payload

		if (!blacklists) return false

		const results = blacklists.flatMap((group) => {
			// Ищем артикулы, которые уже блокируют
			const blocking = group.filter((a) => blockedArticles.includes(a))
			// Ищем артикулы, которые потенциально должны быть заблокированы
			const maybe = group.filter((a) => maybeBlocked.includes(a))

			// Если артикул из maybeBlocked также является блокирующим — пропускаем
			const filteredMaybe = maybe.filter((a) => !blockedArticles.includes(a))

			// Создаём комбинации для всех пар (blocking × filteredMaybe)
			return blocking.length && filteredMaybe.length
				? blocking.flatMap((blockingArticle) =>
						filteredMaybe.map((shouldBlockedArticle) => ({
							blockingArticle,
							shouldBlockedArticle,
							blockListArray: group,
						})),
					)
				: []
		})

		// Если массив пуст — блокировок нет
		return results.length > 0 ? results : false
	},

	setSelectedOption: (selected) => {
		let blockingArticles: T_Product['article'][] = []
		const modifications = {...get().modifications}

		if (!modifications) return

		// #region Build blockingArticles Array
		/**
		 * Проходим по селектам кликнутой модификации
		 * чтобы собрать список выбранных артикулов,
		 * для блокировки опции при повторном прохождении.
		 */
		const selectors = modifications[selected.stepName]

		const options = selectors.find(
			(selector) => selector.selectorId === selected.selectorId,
		)

		if (!options) return

		const option = options.selectorOptions.find(
			(option) => option.id === selected.optionId,
		)

		if (!option) return

		// Собираем массив блокирующих артикулов
		blockingArticles = option.products.map((product) => product.article)
		// #endregion

		// #region Toggle and Block option
		/**
		 * Проходим по всем модификациям (шагам), чтобы:
		 * 1. тогглить выбранную опцию
		 * 2. заблокировать опции в соответствии с
		 *     - blacklists (приходит с бэка, есть в текущем slice )
		 *     - blockingArticles (сгенерировали на первом проходе)
		 */
		Object.values(modifications).forEach((selectors) => {
			selectors.forEach((selector) => {
				const options = selector.selectorOptions

				options.forEach((option) => {
					// Тогглим выбранную опцию
					if (selector.selectorId === selected.selectorId) {
						option.selected = option.id === selected.optionId
					}

					// Блокируем опции согласно blockingArticles и blacklists
					const maybeBlockingProductsArticles = option.products.map(
						(product) => product.article,
					)

					const shouldBlockCurrentOption = get().shouldBlockOption({
						blockedArticles: blockingArticles,
						maybeBlocked: maybeBlockingProductsArticles,
						blacklists: get().blacklist,
					})

					if (shouldBlockCurrentOption) {
						console.log('shouldBlockCurrentOption', shouldBlockCurrentOption)

						const {blockListArray, blockingArticle} =
							shouldBlockCurrentOption[0]

						const blockingSelector = get().getSelectorById({
							selectorId: selected.selectorId,
						})

						const blockingOption = get().getOptionById({
							optionId: selected.optionId,
						})

						console.log('blockingOption', blockingOption)

						option.blockedBy = {
							article: blockingArticle,
							optionArticles: blockingArticles,
							stepName: selected.stepName,
							selectorName: blockingSelector?.selectorName ?? null,
							optionValue: blockingOption?.value ?? null,
							byBlocklist: blockListArray,
						}
					}
				})
			})
		})

		// #endregion

		set({modifications})
	},
})

export const useConfiguration = create<T_ConfigurationSlice>()(
	devtools(
		store,
		{name: 'Configuration Store'}, // 👈 добавь имя стора чтобы в ReduxDevTools можно было на него переключиться
	),
)
