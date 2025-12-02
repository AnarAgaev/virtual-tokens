import {nanoid} from 'nanoid'
import {create, type StateCreator} from 'zustand'
import {devtools} from 'zustand/middleware'
import {haveCommonArticlesExact} from '@/helpers'
import {useComposition} from '@/store'
import type {
	T_ConfigurationSlice,
	T_Id,
	T_Modifications,
	T_ProductExtended,
} from '@/types'
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
	// #region Initial values and Setters
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

			const selectors = filters[stepName]

			// Если в фильтрах нет текущего шага — опциональный селектор с возможностью выбора Нет
			if (!selectors) {
				const products = stepArticles
					.flat()
					.filter(Boolean) // убираем null
					.map((article) => get().getProductByArticle(article))
					.filter((product): product is T_ProductExtended => !!product)

				const options = products.map((product) => ({
					id: nanoid(),
					value: product.article,
					products: [structuredClone(product)],
					selected: false,
				}))

				modifications[stepName] = [
					{
						stepName,
						selectorId: nanoid(),
						selectorName: stepName,
						selectorCode: null,
						selectorOptions: [
							...options,
							{
								id: nanoid(),
								value: 'Нет',
								products: [],
								selected: true,
							},
						],
					},
				]

				continue
			}

			// Стандартный опшен
			modifications[stepName] = Object.entries(selectors).map(
				([code, name]) => {
					const products = stepArticles
						.map((articleArr) => {
							const [baseArticle, ...additionalArticles] = articleArr

							// В качестве основного артикула, берем всегда только первый
							const baseProduct = get().getProductByArticle(baseArticle)

							// Остальные артикулы, если они есть, сохраняем в авто-добавляемые
							const autoAddedProducts = additionalArticles
								.map((article) => get().getProductByArticle(article))
								.filter((product): product is T_ProductExtended => !!product)

							if (baseProduct && autoAddedProducts.length) {
								baseProduct.autoAddedProducts = autoAddedProducts
							}

							return baseProduct
						})
						.filter((product): product is T_Product => !!product)

					const key = code as keyof T_Product

					return {
						stepName,
						selectorId: nanoid(),
						selectorName: name,
						selectorCode: key,
						selectorOptions: [
							...new Set(products.map((product) => String(product[key] ?? ''))),
						]
							.filter(Boolean) // ts type guard
							.map((value) => ({
								id: nanoid(),
								value,
								selected: false,
								products: products
									.filter((product) => String(product[key] ?? '') === value)

									// ✅ клонируем каждый продукт, чтобы `blockedBy` не передавался между селекторами
									.map((product) => ({...product})),
							})),
					}
				},
			)
		}

		set({modifications})
		useComposition.getState().handleModificationsChange()
	},

	getProductByArticle: (article) => {
		if (!article) return null

		const products = get().products

		if (!products) return null

		return products[article]
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

	getSelectedOptionValue: (payload) => {
		const {selector} = payload

		const selectedOption = selector.selectorOptions.filter(
			(option) => option.selected,
		)

		if (!selectedOption.length) return null

		return {
			stepName: selector.stepName,
			selectorId: selector.selectorId,
			selectorCode: selector.selectorCode,
			selectorName: selector.selectorName,
			selectedValue: selectedOption[0].value,
			selectedOptionId: selectedOption[0].id,
		}
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
					: option.products.every(
							(product) => product.blockedBy || product.filteredBy?.length,
						),
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
		 */
		if (!targetOption.products.length) return false

		/**
		 * Блокируем опшен/кнопку если у нее заблокированы все артикулы/продукты
		 * Заблокированные продукты - это продукты у которых есть валидные
		 * свойства BlockedBy или filteredBy
		 */
		return targetOption.products.every(
			(product) => product.blockedBy || product.filteredBy?.length,
		)
	},

	shouldArticleBlocking: (payload) => {
		const {blockingArticles, productArticle} = payload
		const blacklistArr = get().blacklist

		if (!blacklistArr) return false

		for (const blacklistArticlesBlockingGroup of blacklistArr) {
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

	setSelectedOption: (payload) => {
		let blockingArticles: T_Product['article'][] = []
		const modifications = structuredClone({...get().modifications})
		const {isSelected} = payload

		// Получаем данные блокирующего селектора
		const blockingSelector = get().getSelectorById({
			selectorId: payload.selectorId,
		})

		// Получаем данные блокирующей опции/кнопки
		const blockingOption = get().getOptionById({
			optionId: payload.optionId,
		})

		// #region Собираем массив блокирующих артикулов с кликнутой кнопки/опшена
		/**
		 * Проходим по всем опшинам/кнопкам и фильтруем кликнутые
		 * Собираем все артикулы/продукты с кликнутого опшена/кнопки
		 * в массив блокирующих артикулов для блокировки ПРОДУКТА
		 * при повторном прохождении.
		 * Напоминаю: на каждой кнопке/опшине несколько артикулов!
		 *
		 * ! Важно: Опшен/кнопка будут заблокирована, если
		 * ! у нее заблокированы все продукты.
		 */

		const allOptions = Object.values(modifications).flatMap((selectors) =>
			selectors.flatMap((selector) => selector.selectorOptions),
		)

		const option = allOptions.find((option) => option.id === payload.optionId)

		if (!option) return

		// Собираем массив блокирующих артикулов
		blockingArticles = option.products.map((product) => product.article)
		// #endregion

		// #region Тогглим кнопку/опшен + блокируем по блэк-листам и собранному массиву блокирующих артикулов
		/**
		 * Проходим по всем модификациям (шагам) и селекторам в них, чтобы:
		 * 1. тогглим выбранную опцию
		 * 2. блокируем отдельные артикулы/продукты в соответствии с
		 *     - blacklists (приходит с бэка, есть в текущем slice, используем в shouldArticleBlocking)
		 *     - blockingArticles (сгенерировали на первом проходе)
		 */
		Object.values(modifications)
			.flat()
			.forEach((selector) => {
				const options = selector.selectorOptions

				options.forEach((option) => {
					/**
					 * Тогглим выбранную опцию
					 * Работаем с опшенами/кнопками только в рамках одного селекта
					 */
					if (selector.selectorId === payload.selectorId) {
						option.selected = option.id === payload.optionId && !isSelected
					}

					/**
					 * 1. Проходим по всем продуктам текущего итерируемого опшена
					 * 2. Чекаем каждый продукт в опшине/кнопке, нужно ли
					 *    заблокировать текущий артикул/продукт через
					 * 	    - blacklists (приходит с бэка, есть в текущем slice )
					 *      - blockingArticles (сгенерировали на первом проходе)
					 */
					option.products.forEach((product) => {
						const sameSelector =
							selector.selectorId === blockingSelector?.selectorId

						const shouldBlockProduct = sameSelector
							? false
							: get().shouldArticleBlocking({
									blockingArticles,
									productArticle: product.article,
								})

						if (shouldBlockProduct && !option.selected) {
							const {blockingArticle, blacklistArticlesBlockingGroup} =
								shouldBlockProduct

							if (!product.blockedBy) {
								product.blockedBy = []
							}

							product.blockedBy.push({
								blockingArticle,
								blockingArticles,
								stepName: payload.stepName,
								selectorName: blockingSelector?.selectorName ?? null,
								selectorId: blockingSelector?.selectorId ?? null,
								optionValue: blockingOption?.value ?? null,
								optionId: blockingOption?.id ?? null,
								blacklistArticlesBlockingGroup,
							})
						}
					})
				})
			})
		// #endregion

		// #region Если кнопка отжимается, разблокируем, заблокированные ранее этой кнопкой продукты/артикулы
		/**
		 * При смене опции в рамках того же селекта (кликнули по кнопке рядом с выбранной),
		 * разблокируем опции которые были заблокированы ранее соседней опцией из того же селекта,
		 * что и кликнутая:
		 *
		 * 1. собираем список всех артикулов/продуктов из соседних
		 *    опшенов из того же селекта, что и кликнутый.
		 * 2. проходимся
		 *    по всем шагам -> по всем селектам -> по всем опшинам -> по всем артикулам/продуктам
		 *    и если, этот артикул/продукт был заблокирован одним из артикулов/продуктов из соседних
		 *    с кликнутым, разблокируем его.
		 *
		 *    Также, если текущий продукт/артикул был зафильтрован одной из опцией,
		 *    расфильтруем её (удаляем соответствующий объект в filteredBy)
		 */

		const siblingsOptionsWithClicked = isSelected
			? [get().getOptionById({optionId: payload.optionId})]
			: get().getSiblingsOptionsByOptionId({
					optionId: payload.optionId,
				})

		const optionIdsOfSiblingOptions = siblingsOptionsWithClicked.map(
			(option) => option?.id,
		)

		const productsArticlesOfSiblingsOptions =
			siblingsOptionsWithClicked.flatMap((option) => {
				return option?.products
					? option.products.map((product) => product.article)
					: []
			})

		const allProducts = Object.values(modifications)
			.flat()
			.flatMap((selector) => selector.selectorOptions)
			.flatMap((option) => option.products)

		allProducts.forEach((product) => {
			/**
			 * 1. Определяем есть ли в blockedBy текущего продукта блоки из соседних с кликнутым артикулов
			 * 2. Если есть, то только в этом случае, вырезаем и перезаписываем blockedBy
			 */

			const haveCommonArticlesWithSibling = !product.blockedBy
				? false
				: haveCommonArticlesExact(
						productsArticlesOfSiblingsOptions,
						product.blockedBy.map((blockedObj) => blockedObj.blockingArticle),
					)

			if (haveCommonArticlesWithSibling) {
				const filteredBlockedBy = product.blockedBy?.filter((blockedObj) => {
					/**
					 * Один и тот же артикул может быть в разных селекторах,
					 * поэтому если селекторы не совпадают, оставляем блокировку
					 */

					if (blockedObj.selectorId !== payload.selectorId) return true

					return !productsArticlesOfSiblingsOptions.includes(
						blockedObj.blockingArticle,
					)
				})

				product.blockedBy = filteredBlockedBy
			}

			if (product.filteredBy?.length) {
				product.filteredBy = product.filteredBy.filter(
					(filteredObj) =>
						!optionIdsOfSiblingOptions.includes(filteredObj.selectedOptionId),
				)
			}
		})
		// #endregion

		// #region Отфильтровываем опшены/кнопки в рамках одного шага
		/**
		 * Если на шаге в каком-либо опшине/кнопке есть более одного артикула
		 * следовательно, мы не может получить один и только один артикул на шаге
		 * имея единственный селектор. Селекторов должно быть несколько.
		 *
		 * 1. Получаем весь шаг со всеми селектами и опшенами/кнопками от кликнутого опшена/кнопки
		 *
		 * 3. Фильтрация:
		 * - Проходим по каждому селектору
		 * - Определяем есть ли выбора на текущем, итерируемом селекте.
		 *   Если нет, то идем на следующую итерацию.
		 *   Если есть, то:
		 *     1. Получаем подмассив селекторов шага, исключив текущий итерируемый (с выбором);
		 *     2. Проходим по подмассиву и, при необходимости, отфильтровываем продукты.
		 */

		const clickedStepSelectors = modifications[payload.stepName]

		if (clickedStepSelectors.length > 1) {
			/**
			 * Перед началом новой фильтрации,
			 * сбрасываем все filteredBy на всех продуктах.
			 */
			clickedStepSelectors
				.flatMap((selector) =>
					selector.selectorOptions.flatMap((option) => option.products),
				)
				.forEach((product) => {
					product.filteredBy = []
				})

			// Обходим все селекторы и фильтруем продукты, при необходимости.
			clickedStepSelectors.forEach((currentSelector, _idx, selectors) => {
				const selectedData = get().getSelectedOptionValue({
					selector: currentSelector,
				})

				/**
				 * Если на текущем селекторе нет выбранных опшенов,
				 * не фильтруем по этому селектору продукты
				 * из других селекторов.
				 */
				if (!selectedData) {
					return
				}

				// Подмассив селекторов, за исключением текущего, итерируемого.
				const otherSelectors = selectors.filter(
					(s) => s.selectorId !== currentSelector.selectorId,
				)

				const otherSelectorsProducts = otherSelectors.flatMap((selector) =>
					selector.selectorOptions.flatMap((option) => option.products),
				)

				/**
				 * Добавляем фильтратор, если выбранная опция текущего селекта,
				 * отличается у текущего продукта
				 */
				otherSelectorsProducts.forEach((product) => {
					if (
						selectedData.selectorCode &&
						product[selectedData.selectorCode]
							?.toLocaleString()
							.toLowerCase() !==
							selectedData.selectedValue.toLocaleString().toLowerCase()
					) {
						if (!product.filteredBy) {
							product.filteredBy = []
						}
						product.filteredBy.push(selectedData)
					}
				})
			})
		}
		// #endregion

		set({modifications})

		useComposition.getState().handleModificationsChange()
	},

	unblockAllSelector: (payload) => {
		/**
		 * ! Шаг 1.
		 * Проходим по селектору который нужно разблокировать и:
		 * - Определяем всех инициаторов блокировки - [сохраняем в массив блокираторов]
		 * - Определяем всех инициаторов фильтрации - [сохраняем в массив блокираторов]
		 *
		 * ! Шаг 2.
		 * Проходим по всем Модификациям и выполняем:
		 * 1. Смотрим в каждый продукт, и если, он был заблокирован
		 *    или зафильтрован кем-то из массива блокираторов, снимаем его блокировку
		 *    и блокирующую фильтрацию (убираем свойства blockedBy и filteredBy)
		 * 2. В том случае, если на очередной итерации - это блокирующая опция,
		 *    снимаем выбор этой опции (свойство selected = false)
		 */

		const modifications = {...get().modifications}
		const allSelectors = Object.values(modifications).flat()
		const blockingOptionsIds = new Set<T_Id>()

		// #region Шаг 1.
		const targetSelector = allSelectors.find(
			(selector) => selector.selectorId === payload.selectorId,
		)

		if (!targetSelector) return

		const targetProducts = targetSelector.selectorOptions.flatMap(
			(option) => option.products,
		)

		targetProducts.forEach((product) => {
			if (product.blockedBy?.optionId) {
				blockingOptionsIds.add(product.blockedBy?.optionId)
			}

			if (product.filteredBy) {
				product.filteredBy.forEach((filter) => {
					blockingOptionsIds.add(filter.selectedOptionId)
				})
			}
		})
		// #endregion

		// #region Шаг 2.
		const allProducts = allSelectors
			.flatMap((selector) => selector.selectorOptions)
			.flatMap((option) => {
				// Разблокируем опцию блокиратор
				if (blockingOptionsIds.has(option.id)) {
					option.selected = false
				}

				return option.products
			})

		allProducts.forEach((product) => {
			const {blockedBy, filteredBy} = product

			if (blockedBy?.optionId && blockingOptionsIds.has(blockedBy.optionId)) {
				delete product.blockedBy
			}

			if (filteredBy?.length) {
				filteredBy.forEach((filter) => {
					if (blockingOptionsIds.has(filter.selectedOptionId)) {
						delete product.filteredBy
					}
				})
			}
		})
		// #endregion

		set({modifications})

		useComposition.getState().handleModificationsChange()
	},
})

export const useConfiguration = create<T_ConfigurationSlice>()(
	devtools(store, {
		name: 'Configuration Store', // 👈 добавь имя стора чтобы в ReduxDevTools можно было на него переключиться
		enabled: true, // включаем Redux devTools для продакшена
	}),
)
