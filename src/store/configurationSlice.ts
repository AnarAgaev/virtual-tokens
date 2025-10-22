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
	// #region Temp --- Hidden code!
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
	// #endregion

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
			// Унарный опшен - Да или Нет
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
						.map((article) => get().getProductByArticle(article ?? ''))
						.filter((product): product is T_Product => !!product)

					return {
						selectorId: nanoid(),
						selectorName: name,
						selectorCode: key,
						selectorOptions: [
							...new Set(products.map((product) => String(product[key] ?? ''))),
						]
							.filter(Boolean)
							.map((value) => ({
								id: nanoid(),
								value,
								selected: false,
								products: products.filter(
									(product) => String(product[key] ?? '') === value,
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

	getSiblingsOptionsByOptionId: (payload) => {
		const selectors = Object.values({...get().modifications}).flat()

		const targetSelector = selectors.find((selector) => {
			const options = selector.selectorOptions
			return options.some((option) => option.id === payload.optionId)
		})

		if (!targetSelector) return []

		return targetSelector.selectorOptions.filter(
			(option) => option.id !== payload.optionId,
		)
	},

	shouldBlockOption: (payload) => {
		const {blockingArticles, maybeBlocked, blacklists, blockingSelector} =
			payload

		if (!blacklists) return false

		// если селектор есть — собираем все артикулы из него
		const sameSelectorArticles =
			blockingSelector?.selectorOptions.flatMap((opt) =>
				opt.products.map((p) => p.article),
			) ?? []

		const results = blacklists.flatMap((articleGroup) => {
			// артикулы, которые блокируют
			const blocking = articleGroup.filter((article) =>
				blockingArticles.includes(article),
			)

			// артикулы, которые могут быть заблокированы
			const maybe = articleGroup.filter((article) =>
				maybeBlocked.includes(article),
			)

			// исключаем артикулы, если они принадлежат тому же селектору, что и blockingSelector
			const filteredMaybe = maybe.filter(
				(article) =>
					!blockingArticles.includes(article) &&
					!sameSelectorArticles.includes(article),
			)

			// создаём комбинации (blocking × filteredMaybe)
			return blocking.length && filteredMaybe.length
				? blocking.flatMap((blockingArticle) =>
						filteredMaybe.map((shouldBlockedArticle) => ({
							blockingArticle,
							shouldBlockedArticle,
							blockListArray: articleGroup,
						})),
					)
				: []
		})

		return results.length > 0 ? results : false
	},

	setSelectedOption: (selected) => {
		let blockingArticles: T_Product['article'][] = []
		const modifications = {...get().modifications}

		const {isSelected} = selected
		console.log('isSelected', isSelected)

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
						option.selected = option.id === selected.optionId && !isSelected
					}

					// Получаем данные блокирующего
					const blockingSelector = get().getSelectorById({
						selectorId: selected.selectorId,
					})

					const blockingOption = get().getOptionById({
						optionId: selected.optionId,
					})

					// Блокируем опции согласно blockingArticles и blacklists
					const maybeBlockingProductsArticles = option.products.map(
						(product) => product.article,
					)

					const shouldBlockCurrentOption = get().shouldBlockOption({
						blockingArticles,
						maybeBlocked: maybeBlockingProductsArticles,
						blacklists: get().blacklist,
						blockingSelector,
					})

					if (shouldBlockCurrentOption) {
						const {blockListArray, blockingArticle} =
							shouldBlockCurrentOption[0]

						option.blockedBy = {
							article: blockingArticle,
							optionArticles: blockingArticles,
							stepName: selected.stepName,
							selectorName: blockingSelector?.selectorName ?? null,
							selectorId: blockingSelector?.selectorId ?? null,
							optionValue: blockingOption?.value ?? null,
							optionId: blockingOption?.id ?? null,
							byBlocklist: blockListArray,
						}
					}
				})
			})
		})
		// #endregion

		// #region Unlocking previously blocked options
		/**
		 * Разблокируем опции которые были заблокированы ранее
		 * опцией из того же селекта, что и кликнутая:
		 *
		 * 1. собираем список соседних опшенов из того же селекта, что и кликнутый
		 * 2. проходимся по всем шагам -> по всем селектам -> по всем опшинам
		 *    и если, этот опшен был заблокирован одним из опшенов из соседних
		 *    с кликнутым, разблокируем его.
		 */

		const siblingsOptionsWithClicked = isSelected
			? [get().getOptionById({optionId: selected.optionId})]
			: get().getSiblingsOptionsByOptionId({
					optionId: selected.optionId,
				})
		const siblingsOptionsIds = siblingsOptionsWithClicked.map(
			(option) => option?.id,
		)

		Object.values(modifications).forEach((selectors) => {
			selectors.forEach((selector) => {
				const options = selector.selectorOptions

				options.forEach((option) => {
					if (!option.blockedBy) return

					if (
						option.blockedBy.optionId &&
						siblingsOptionsIds.includes(option.blockedBy.optionId)
					) {
						delete option.blockedBy
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
