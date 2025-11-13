import {nanoid} from 'nanoid'
import {create, type StateCreator} from 'zustand'
import {devtools} from 'zustand/middleware'
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

			// Если в фильтрах нет текущего шага — унарный опшен (Да / Нет)
			if (!selectors) {
				const positiveProducts: T_ProductExtended[] = []

				stepArticles.forEach(([article]) => {
					const product = get().getProductByArticle(article)
					if (product) positiveProducts.push(product)
				})

				const selectorOptions = [
					{
						id: nanoid(),
						value: 'Да',
						// ✅ создаём клон продукта, чтобы у каждой кнопки был свой экземпляр
						products: positiveProducts.map((product) => ({...product})),
						selected: false,
					},
					{
						id: nanoid(),
						value: 'Нет',
						products: [],
						selected: true,
					},
				]

				modifications[stepName] = [
					{
						stepName,
						selectorId: nanoid(),
						selectorName: stepName,
						selectorCode: null,
						selectorOptions,
					},
				]

				continue
			}

			// Стандартный опшен
			modifications[stepName] = Object.entries(selectors).map(
				([code, name]) => {
					const products = stepArticles
						.map((articleArr) => {
							//! На тот случай если в массиве артикулов более одного,
							//! в качестве основного берем только первый
							const baseArticle = get().getProductByArticle(articleArr[0])

							//! Второй артикул, если он есть, сохраняем в авто-добавляемые
							const autoAddedArticle = articleArr[1]
							if (autoAddedArticle) {
								const product = get().getProductByArticle(autoAddedArticle)

								if (baseArticle && product) {
									baseArticle.autoAddedArticle = product
								}
							}

							return baseArticle
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
		const modifications = {...get().modifications}
		const {isSelected} = payload

		// #region Собираем массив блокирующих артикулов с кликнутой кнопки/опшена
		/**
		 * Проходим по всем опшинам/кнопкам и фильтруем кликнутые
		 * Собираем все артикулы/продукты с кликнутого опшена/кнопки
		 * в массив блокирующих артикулов для блокировки ПРОДУКТА
		 * при повторном прохождении.
		 * (на каждой кнопке/опшине несколько артикулов),
		 *
		 * Опшен/кнопка будут заблокирована, если у нее заблокированы
		 * все продукты.
		 */

		const allOptions = Object.values(modifications).flatMap((selectors) =>
			selectors.flatMap((selector) => selector.selectorOptions),
		)

		const option = allOptions.find((option) => option.id === payload.optionId)

		if (!option) return

		// Собираем массив блокирующих артикулов
		blockingArticles = option.products.map((product) => product.article)
		// #endregion

		// #region Меняем состояние кликнутой кнопки/опшена + блокируем
		/**
		 * Проходим по всем модификациям (шагам) и селекторам в них, чтобы:
		 * 1. тогглим выбранную опцию
		 * 2. блокируем отдельные артикулы/продукты в соответствии с
		 *     - blacklists (приходит с бэка, есть в текущем slice, используем в shouldArticleBlocking)
		 *     - blockingArticles (сгенерировали на первом проходе)
		 */
		Object.values(modifications).forEach((selectors) => {
			selectors.forEach((selector) => {
				const options = selector.selectorOptions

				options.forEach((option) => {
					/**
					 * Тогглим выбранную опцию
					 * Работаем с опшенами/кнопками только в рамках одного селекта
					 */
					if (selector.selectorId === payload.selectorId) {
						option.selected = option.id === payload.optionId && !isSelected
					}

					// Получаем данные блокирующего селектора
					const blockingSelector = get().getSelectorById({
						selectorId: payload.selectorId,
					})

					// Получаем данные блокирующей опции/кнопки
					const blockingOption = get().getOptionById({
						optionId: payload.optionId,
					})

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

							product.blockedBy = {
								blockingArticle,
								blockingArticles,
								stepName: payload.stepName,
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

		// #region Если кнопка отжимается, разблокируем, заблокированные ранее этой продукты/артикулы
		/**
		 * При смене опции в рамках того же селекта
		 * (кликнули по кнопке рядом с выбранной),
		 * разблокируем опции которые были заблокированы ранее
		 * соседней опцией из того же селекта, что и кликнутая:
		 *
		 * 1. собираем список всех артикулов/продуктов из соседних
		 *    опшенов из того же селекта, что и кликнутый.
		 * 2. проходимся
		 *    по всем шагам -> по всем селектам -> по всем опшинам -> по всем артикулам/продуктам
		 *    и если, этот артикул/продукт был заблокирован одним из артикулов/продуктов из соседних
		 *    с кликнутым, разблокируем его.
		 */

		const siblingsOptionsWithClicked = isSelected
			? [get().getOptionById({optionId: payload.optionId})]
			: get().getSiblingsOptionsByOptionId({
					optionId: payload.optionId,
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

		// #region Блокируем опшены/кнопки в рамках одного шага
		/**
		 * Если на шаге в каком-либо опшине/кнопке есть более одного артикула
		 * следовательно, мы не может получить один и только один артикул на шаге
		 * имея единственный селектор. Селекторов должно быть несколько.
		 *
		 * 1. Получаем весь шаг со всеми селектами и опшенами/кнопками от кликнутого опшена/кнопки
		 * 2. Если на шаге несколько селекторов, создаем ШЕЛЛОУ копию списка селектов ("виртуальный" массив селектов)
		 * 3. Сортируем селекты в копии, перемещая селекторы с кликнутыми/выбранными ошенами/кнопками, наверх
		 * 4. Проходим по всей шеллоу копии и рекурсивно фильтруем (определяем артикулы которые нужно заблокировать
		 *    и заполняем свойство-блокиратор на оригинальном продукте/артикуле)
		 */

		const clickedStepSelectors = modifications[payload.stepName]

		if (clickedStepSelectors.length > 1) {
			// Сбрасываем все filteredBy на текущем шаге перед началом новой фильтрации
			clickedStepSelectors.forEach((selector) => {
				selector.selectorOptions.forEach((option) => {
					option.products.forEach((product) => {
						delete product.filteredBy
					})
				})
			})

			// Создаем поверхностную копию массива селекторов
			const shallowCopySelectors = [...clickedStepSelectors]

			// Сортируем копию: селекторы с выбранными опциями идут первыми
			shallowCopySelectors.sort((a, b) => {
				const aHasSelected = a.selectorOptions.some((option) => option.selected)
				const bHasSelected = b.selectorOptions.some((option) => option.selected)

				if (aHasSelected === bHasSelected) return 0
				if (aHasSelected) return -1
				return 1
			})

			// Создаем глубокую копию продуктов для работы
			const virtualSelectors = shallowCopySelectors.map((selector) => ({
				...selector,
				selectorOptions: selector.selectorOptions.map((option) => ({
					...option,
					products: option.products.map((product) => ({...product})),
				})),
			}))

			virtualSelectors.forEach((selector, idx, selectors) => {
				// Получаем выбранное значение текущего/итерируемого селектора
				const selectedData = get().getSelectedOptionValue({selector})

				if (!selectedData) return

				/**
				 * Получаем подмассив после текущего индекса
				 * для блокировки в нем продуктов с отличными
				 * свойствами от выбранных (selectedValue)
				 *
				 * Откидываем все селекты до текущего, для того
				 * чтобы дважды не блокировать уже выбранные селекты
				 */
				const filteringSelectors = selectors.slice(idx + 1)

				filteringSelectors.forEach((selector) => {
					selector.selectorOptions.forEach((option) => {
						option.products.forEach((product) => {
							if (
								selectedData.selectorCode &&
								product[selectedData.selectorCode] !==
									selectedData.selectedValue
							) {
								product.filteredBy = selectedData
							}
						})
					})
				})
			})

			/**
			 * Синхронизируем отфильтрованные продукты из virtualSelectors
			 * с продуктами внутри modifications (добавляем свойство filteredBy)
			 */
			modifications[payload.stepName].forEach((selector) => {
				const virtualSelector = virtualSelectors.find(
					(s) => s.selectorId === selector.selectorId,
				)

				if (!virtualSelector) return

				selector.selectorOptions.forEach((option) => {
					const virtualOption = virtualSelector.selectorOptions.find(
						(vo) => vo.id === option.id,
					)

					if (!virtualOption) return

					option.products.forEach((product) => {
						const virtualProduct = virtualOption.products.find(
							(p) => p.id === product.id,
						)

						if (!virtualProduct) return

						if (virtualProduct.filteredBy) {
							product.filteredBy = virtualProduct.filteredBy
						}
					})
				})
			})
		}
		// #endregion

		set({modifications})

		useComposition.getState().handleModificationsChange()
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

		useComposition.getState().handleModificationsChange()
	},
})

export const useConfiguration = create<T_ConfigurationSlice>()(
	devtools(
		store,
		{name: 'Configuration Store', trace: true}, // 👈 добавь имя стора чтобы в ReduxDevTools можно было на него переключиться
	),
)
