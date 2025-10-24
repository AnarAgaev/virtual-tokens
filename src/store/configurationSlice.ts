import {nanoid} from 'nanoid'
import {create, type StateCreator} from 'zustand'
import {devtools} from 'zustand/middleware'
import type {T_ConfigurationSlice, T_Id, T_Modifications} from '@/types'
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

	hasSomeBlockedOptionBySelectorId: (payload) => {
		const {selectorId} = payload

		const selector = get().getSelectorById({selectorId})

		if (!selector) return false

		const options = selector.selectorOptions

		return options
			.flatMap((option) =>
				!option.products.length
					? false
					: option.products.every((product) => product.blockedBy),
			)
			.includes(true)
	},

	shouldOptionBlocking: (payload) => {
		const modifications = {...get().modifications}
		const selectorsArr = Object.values(modifications).flat()
		const optionsArr = selectorsArr.flatMap(
			(selector) => selector.selectorOptions,
		)
		const targetOption = optionsArr.find(
			(option) => option.id === payload.optionId,
		)

		if (!targetOption) return false

		/**
		 * Не блокируем опшены/кнопки с пустыми массивами артикулов/продуктов.
		 * Это опшены внутри селекторов Да/Нет
		 *
		 */
		if (!targetOption.products.length) return false

		// Блокируем опшен/кнопку если у нее заблокированы все артикулы/продукты
		return targetOption.products.every((product) => product.blockedBy)
	},

	shouldArticleBlocking: (payload) => {
		const {blockingArticles, productArticle, blacklists} = payload

		if (!blacklists) return false

		for (const blacklistArticlesBlockingGroup of blacklists) {
			if (!blacklistArticlesBlockingGroup.includes(productArticle)) continue

			for (const blockingArticle of blockingArticles) {
				if (
					blockingArticle !== productArticle &&
					blacklistArticlesBlockingGroup.includes(blockingArticle)
				) {
					return {blockingArticle, blacklistArticlesBlockingGroup}
				}
			}
		}

		return false
	},

	setSelectedOption: (selected) => {
		let blockingArticles: T_Product['article'][] = []
		const modifications = {...get().modifications}
		const {isSelected} = selected

		// #region Build blockingArticles Array
		/**
		 * Проходим по селектам кликнутой модификации
		 * чтобы собрать коллекцию выбранных артикулов
		 * (на каждой кнопке/опшине несколько артикулов),
		 * для блокировки ПРОДУКТА при повторном прохождении.
		 *
		 * Опция будут заблокирована, если у нее заблокированы все продукты.
		 */
		const selectors = modifications[selected.stepName]

		const targetSelector = selectors.find(
			(selector) => selector.selectorId === selected.selectorId,
		)

		if (!targetSelector) return

		const option = targetSelector.selectorOptions.find(
			(option) => option.id === selected.optionId,
		)

		if (!option) return

		// Собираем массив блокирующих артикулов
		blockingArticles = option.products.map((product) => product.article)
		// #endregion

		// #region Toggle and Block option/button
		/**
		 * Проходим по всем модификациям (шагам), чтобы:
		 * 1. тогглить выбранную опцию
		 * 2. заблокировать отдельные артикулы/продукты в соответствии с
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

					// Получаем данные блокирующего селектора
					const blockingSelector = get().getSelectorById({
						selectorId: selected.selectorId,
					})

					// Получаем данные блокирующей опции/кнопки
					const blockingOption = get().getOptionById({
						optionId: selected.optionId,
					})

					/**
					 * 1. Проходим по всем продуктам текущего опшена
					 * 2. Чекаем каждый, нужно ли заблокировать текущий артикул/продукт через
					 * 	   - blacklists (приходит с бэка, есть в текущем slice )
					 *     - blockingArticles (сгенерировали на первом проходе)
					 */

					option.products.forEach((product) => {
						const shouldBlockProduct =
							// Если селектор кликнутого опшена такой же как селектор текущего продукта
							// то не надо блокировать, чтобы не блокировались соседние с кликнутым
							// опшены, находящиеся в одном блэк листе с кликнутым
							selector.selectorId === blockingSelector?.selectorId
								? false
								: get().shouldArticleBlocking({
										blockingArticles,
										productArticle: product.article,
										blacklists: get().blacklist,
									})

						if (shouldBlockProduct) {
							const {blockingArticle, blacklistArticlesBlockingGroup} =
								shouldBlockProduct

							product.blockedBy = {
								blockingArticle,
								blockingArticles,
								stepName: selected.stepName,
								selectorName: blockingSelector?.selectorName ?? null,
								selectorId: blockingSelector?.selectorId ?? null,
								optionValue: blockingOption?.value ?? null,
								optionId: blockingOption?.id ?? null,
								blacklistArticlesBlockingGroup,
							}
						}
					})
				})
			})
		})
		// #endregion

		// #region Unlocking previously blocked options
		/**
		 * При смене опции в рамках того же селекта
		 * (кликнули по кнопке рядом с выбранной),
		 * разблокируем опции которые были заблокированы ранее
		 * опцией из того же селекта, что и кликнутая:
		 *
		 * 1. собираем список всех артикулов/продуктов из соседних
		 *    опшенов из того же селекта, что и кликнутый.
		 * 2. проходимся
		 *    по всем шагам -> по всем селектам -> по всем опшинам -> по всем артикулам/продуктам
		 *    и если, этот артикул/продукт был заблокирован одним из артикулов/продуктов из соседних
		 *    с кликнутым, разблокируем его.
		 */

		const siblingsOptionsWithClicked = isSelected
			? [get().getOptionById({optionId: selected.optionId})]
			: get().getSiblingsOptionsByOptionId({
					optionId: selected.optionId,
				})

		const productsArticlesOfSiblingsOptions =
			siblingsOptionsWithClicked.flatMap((option) => {
				return option?.products
					? option.products.map((product) => product.article)
					: []
			})

		Object.values(modifications).forEach((selectors) => {
			selectors.forEach((selector) => {
				const options = selector.selectorOptions

				options.forEach((option) => {
					const products = option.products

					products.forEach((product) => {
						if (!product.blockedBy) return

						if (
							productsArticlesOfSiblingsOptions.includes(
								product.blockedBy.blockingArticle,
							)
						) {
							delete product.blockedBy
						}
					})
				})
			})
		})
		// #endregion

		set({modifications})
	},

	unblockAllSelector: (payload) => {
		const modifications = {...get().modifications}
		const blockingOptionIds = new Set<T_Id>()

		/**
		 * Проходим по всем опшинам селектора в соответствии с полученным selectorId и:
		 * 1. проходим по всем артикулам/продуктам текущего опшена и снимаем блокировку
		 * 2. сохраняем все ИД заблокировавших опшенов/кнопок в массив блокираторов
		 * 3. второй раз проходим по всем шагам и снимаем выбор со всех
		 *    опшенов/кнопок если его ИД есть в массиве блокираторов
		 */

		Object.values(modifications)
			.flat()
			.forEach((selector) => {
				if (selector.selectorId === payload.selectorId) {
					selector.selectorOptions.forEach((option) => {
						option.products.forEach((product) => {
							if (product.blockedBy?.optionId) {
								// Сохраняем заблокировавший артикул в массив блокираторов
								blockingOptionIds.add(product.blockedBy.optionId)

								// Удаляем блокировку
								delete product.blockedBy
							}
						})
					})
				}
			})

		Object.values(modifications)
			.flat()
			.forEach((selector) => {
				selector.selectorOptions.forEach((option) => {
					if (blockingOptionIds.has(option.id)) {
						option.selected = false
					}
				})
			})

		set({modifications})
	},
})

export const useConfiguration = create<T_ConfigurationSlice>()(
	devtools(
		store,
		{name: 'Configuration Store'}, // 👈 добавь имя стора чтобы в ReduxDevTools можно было на него переключиться
	),
)
