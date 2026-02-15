import {nanoid} from 'nanoid'
import {create, type StateCreator} from 'zustand'
import {devtools} from 'zustand/middleware'
import {useComposition} from '@/store'
import type {
	T_ConfigurationSlice,
	T_Modifications,
	T_ProductExtended,
	T_SelectionPayload,
	T_SelectorAndOptionPair,
} from '@/types'
import type {T_Product} from '@/zod'

const store: StateCreator<T_ConfigurationSlice> = (set, get) => ({
	// #region Initial values and Setter
	steps: null,
	stepsCount: null,
	hardFilterSteps: null,
	filters: null,
	characteristics: null,
	blacklist: null,
	titles: null,
	units: null,
	combos: null,
	products: null,
	description: null,
	videos: [],
	files: [],

	setInitData: (payload) => {
		set({...payload})
	},
	// #endregion

	createModifications: () => {
		const modifications: T_Modifications = {}

		const steps = get().steps

		if (!steps) return

		const stepListArr = Object.keys(steps)

		for (const stepName in steps) {
			const stepArticles = steps[stepName]
			if (!stepArticles) continue

			const filters = get().filters
			if (!filters) continue

			const selectors = filters[stepName]

			const selectorListArr = selectors ? Object.keys(selectors) : []

			// Если в фильтрах нет текущего шага - опциональный селектор с возможностью выбора Нет
			if (!selectors) {
				/**
				 * Шаги с бинарным выбором являются не обязательными
				 * и не влияют на итоговый Виртуальный артикул,
				 * поэтом сразу пропускаем этот шаг.
				 *
				 * При необходимости, в дальнейшем, можно включить,
				 * раскомментировав код ниже.
				 *
				 * ! НЕ УДАЛЯТЬ
				 */

				// const products = stepArticles
				// 	.flat()
				// 	.filter(Boolean) // убираем null
				// 	.map((article) => get().getProductByArticle(article))
				// 	.filter((product): product is T_ProductExtended => !!product)
				// const options = products.map((product) => ({
				// 	id: nanoid(),
				// 	value: product.article,
				// 	products: [structuredClone(product)],
				// 	selected: false,
				// }))
				// modifications[stepName] = [
				// 	{
				// 		stepName,
				// 		selectorId: nanoid(),
				// 		selectorName: stepName,
				// 		selectorCode: null,
				// 		selectorOptions: [
				// 			...options,
				// 			{
				// 				id: nanoid(),
				// 				value: 'Нет',
				// 				products: [],
				// 				selected: true,
				// 			},
				// 		],
				// 	},
				// ]

				continue
			}

			// Стандартный опшен
			modifications[stepName] = Object.entries(selectors).map(
				([code, name]) => {
					const products = stepArticles
						.map((articleArr) => {
							const [baseArticle, ...additionalArticles] = articleArr

							// #region Фикс для шага Светодиодный модуль + Драйверы
							/**
							 * Для создания логики динамического шага выбора Драйвера
							 * в список артикулов на шаге Светодиодный модуль, для артикулов
							 * со встроенным драйвером, в админке добавили
							 * второе значение в массиве - null
							 *
							 * Артикулы со встроенными драйверами сохраняем в отдельную
							 * структуру данных productsWithBuiltInDriver
							 *
							 * Значения Null из списков артикулов, шага Светодиодный модуль,
							 * будут вырезаны ниже по коду.
							 *
							 * https://bt24.ddns.net/company/personal/user/12820/tasks/task/view/53290/?from=rest_placement&from_app=app.68401607a3a4a2.97204499
							 */
							if (
								stepName === 'Светодиодный модуль' &&
								baseArticle &&
								additionalArticles.includes(null)
							) {
								get().addProductAsWithBuiltInDriver({
									productArticle: baseArticle,
								})
							}
							// #endregion

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
					const isFirstStep = stepListArr.indexOf(stepName) === 0
					const isFirstSelector = selectorListArr.indexOf(code) === 0

					return {
						stepName,
						selectorId: nanoid(),
						selectorName: name,
						selectorCode: key,
						selectorSelectedStatus:
							isFirstStep && isFirstSelector ? 'unselected' : 'blocked',
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

									// клонируем каждый продукт, чтобы `blockedBy` не передавался между селекторами
									.map((product) => ({...product})),
							})),
					}
				},
			)
		}

		set({modifications})

		useComposition.getState().handleModificationsChange()
		useComposition.getState().updateTotalPrice()

		useComposition.getState().setResultAdditionalData()
		useComposition.getState().setResultCharacteristics()

		useComposition.getState().resetComposition()
	},

	getResolvedBlockingArticle: (payload, modifications) => {
		const stepSelectors = modifications[payload.stepName]

		if (!stepSelectors) return null

		if (stepSelectors.length === 1) {
			const selectorOptions = stepSelectors[0].selectorOptions

			const selectedOption = selectorOptions.find((option) => option.selected)

			if (!selectedOption) return null

			if (selectedOption.products.length === 1) {
				return selectedOption.products[0].article
			}

			return null
		}

		// Шаг с несколькими селекторами
		const allSelectedOptions = stepSelectors
			.map(
				(selector) =>
					selector.selectorOptions.find((option) => option.selected) ?? null,
			)
			.filter(Boolean)

		if (allSelectedOptions.length !== stepSelectors.length) return null

		const productArrays = allSelectedOptions.map((option) =>
			option ? option.products : [],
		)

		const commonProducts = productArrays.reduce(
			(intersection, currentProducts) => {
				return intersection.filter((product) =>
					currentProducts.some(
						(currentProduct) => currentProduct.id === product.id,
					),
				)
			},
			productArrays[0] ?? [],
		)

		if (commonProducts.length === 1) {
			return commonProducts[0].article
		}

		return null
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

		if (!targetOption)
			return {
				shouldBlock: false,
			}

		/**
		 * Не блокируем опшены/кнопки с пустыми массивами артикулов/продуктов.
		 * Это опшены внутри селекторов Да/Нет
		 */
		if (!targetOption.products.length)
			return {
				shouldBlock: false,
			}

		/**
		 * Блокируем опшен/кнопку если у нее заблокированы все артикулы/продукты
		 * Заблокированные продукты - это продукты у которых есть валидные
		 * свойства BlockedBy или filteredBy
		 */
		const isBlocked = targetOption.products.every(
			(product) => product.blockedBy || product.filteredBy?.length,
		)

		if (isBlocked) {
			return {
				shouldBlock: true,
				blockedBy: targetOption.products[0].blockedBy,
				filteredBy: targetOption.products[0].filteredBy,
			}
		}

		return {
			shouldBlock: false,
		}
	},

	shouldArticleBlocking: (payload) => {
		const {blockingArticle, productArticle} = payload
		const blacklistArr = get().blacklist

		if (!blockingArticle) return false

		if (!blacklistArr) return false

		for (const blacklistArticlesBlockingGroup of blacklistArr) {
			// Подтверждаем то, что в текущем блэклисте есть проверяемый артикул
			if (!blacklistArticlesBlockingGroup.includes(productArticle)) continue

			if (
				blockingArticle !== productArticle &&
				/**
				 * ! Проверяем то, что блокирующий артикул в блэклисте стоит НА ПЕРВОМ МЕСТЕ
				 */
				blacklistArticlesBlockingGroup[0] === blockingArticle
			) {
				return {blockingArticle, blacklistArticlesBlockingGroup}
			}
		}

		return false
	},

	setSelectedOption: (payload) => {
		const modifications = structuredClone({...get().modifications})

		// * Тогглим Блокировку/Разблокировку селектов --- START
		// #region
		/** Собираем карту идентификаторов селекторов, для того чтобы понимать
		 * порядковый номер итерируемого относительно выбираемого
		 */
		const selectorIdsMap = Object.values(modifications)
			.flat()
			.map((selector) => selector.selectorId)

		const clickedSelectorPlaceIdx = selectorIdsMap.indexOf(payload.selectorId)

		const productsWithBuiltInDriver = get().productsWithBuiltInDriver
		// biome-ignore lint/complexity/useLiteralKeys: Такое название шага приходит с бэка. В случае изменения API данных, поменять в коде
		const driverSelectorsCount = modifications['Драйвер']?.length ?? 0

		const willHaveBuiltInDriver = Object.values(modifications)
			.flat()
			.flatMap((s) => s.selectorOptions)
			.filter((o) => o.id === payload.optionId && !payload.isSelected)
			.flatMap((o) => o.products)
			.some((p) => productsWithBuiltInDriver.includes(p.article))

		Object.values(modifications)
			.flat()
			.forEach((selector) => {
				const currentSelectorPlaceIdx = selectorIdsMap.indexOf(
					selector.selectorId,
				)

				// Работаем только с селекторами начиная с кликнутого
				if (!(currentSelectorPlaceIdx >= clickedSelectorPlaceIdx)) return

				if (!payload.isSelected) {
					// Обновляем selectorSelectedStatus
					if (clickedSelectorPlaceIdx === currentSelectorPlaceIdx) {
						selector.selectorSelectedStatus = 'selected'
					} else if (clickedSelectorPlaceIdx + 1 === currentSelectorPlaceIdx) {
						selector.selectorSelectedStatus = 'unselected'
					} else if (
						willHaveBuiltInDriver &&
						clickedSelectorPlaceIdx + 1 + driverSelectorsCount ===
							currentSelectorPlaceIdx &&
						selectorIdsMap[clickedSelectorPlaceIdx + 1] ===
							// biome-ignore lint/complexity/useLiteralKeys: Такое название шага приходит с бэка. В случае изменения API данных, поменять в коде
							modifications['Драйвер']?.[0]?.selectorId
					) {
						selector.selectorSelectedStatus = 'unselected'
					} else {
						selector.selectorSelectedStatus = 'blocked'
					}
				} else {
					if (clickedSelectorPlaceIdx === currentSelectorPlaceIdx) {
						selector.selectorSelectedStatus = 'unselected'
					} else {
						selector.selectorSelectedStatus = 'blocked'
					}
				}

				// Обрабатываем селекторы НИЖЕ кликнутого:
				// сбрасываем выбор опций и снимаем наложенные ими блокировки/фильтрации
				if (currentSelectorPlaceIdx > clickedSelectorPlaceIdx) {
					selector.selectorOptions.forEach((option) => {
						if (option.selected) {
							/**
							 * Получаем итоговый блокирующий артикул сбрасываемой опции
							 * через getResolvedBlockingArticle - симулируем что опция выбрана
							 * (isSelected: false = опция считается выбранной в методе)
							 */
							const resetPayload: T_SelectionPayload = {
								stepName: selector.stepName,
								selectorId: selector.selectorId,
								optionId: option.id,
								isSelected: false,
							}

							const resetBlockingArticle = get().getResolvedBlockingArticle(
								resetPayload,
								modifications,
							)

							// Проходим по всем продуктам и снимаем блокировки/фильтрации
							// наложенные сбрасываемой опцией
							Object.values(modifications)
								.flat()
								.flatMap((selector) => selector.selectorOptions)
								.flatMap((option) => option.products)
								.forEach((product) => {
									// Снимаем blockedBy наложенный итоговым артикулом сбрасываемой опции
									if (product.blockedBy?.length && resetBlockingArticle) {
										product.blockedBy = product.blockedBy.filter(
											(blockedObj) =>
												blockedObj.selectorId !== selector.selectorId ||
												blockedObj.blockingArticle !== resetBlockingArticle,
										)

										if (!product.blockedBy.length) {
											delete product.blockedBy
										}
									}

									// Снимаем filteredBy наложенный сбрасываемой опцией
									if (product.filteredBy?.length) {
										product.filteredBy = product.filteredBy.filter(
											(filteredObj) =>
												filteredObj.selectedOptionId !== option.id,
										)

										if (!product.filteredBy.length) {
											delete product.filteredBy
										}
									}
								})
						}

						// Сбрасываем выбор опции
						option.selected = false
					})
				}
			})
		// #endregion

		// * Снимаем блокировки и фильтрации наложенные ранее выбранной опцией --- START
		// #region
		/**
		 * Определяем артикул который нужно разблокировать.
		 *
		 * Если кнопка ОТЖИМАЕТСЯ - получаем артикул кликнутой опции,
		 * симулируя что она ещё выбрана (isSelected: false).
		 *
		 * Если кнопка НАЖИМАЕТСЯ (переключение) - находим ранее выбранную
		 * соседнюю опцию в том же селекторе и получаем её артикул.
		 *
		 * Важно: этот блок выполняется ДО тогглинга option.selected,
		 * поэтому previouslySelectedOption корректно находится через option.selected
		 */
		const unblockingArticle: T_Product['article'] | null = (() => {
			if (payload.isSelected) {
				// Кнопка отжимается - симулируем что она ещё выбрана
				// передавая isSelected: false, метод найдёт опцию как выбранную
				const previousPayload: T_SelectionPayload = {
					...payload,
					isSelected: false,
				}

				return get().getResolvedBlockingArticle(previousPayload, modifications)
			}

			// Кнопка нажимается - ищем ранее выбранную опцию в том же селекторе
			const currentSelector = Object.values(modifications)
				.flat()
				.find((selector) => selector.selectorId === payload.selectorId)

			const previouslySelectedOption =
				currentSelector?.selectorOptions.find((option) => option.selected) ??
				null

			// В селекторе не было выбора - нечего разблокировать
			if (!previouslySelectedOption) return null

			// Симулируем payload от ранее выбранной опции
			const previousPayload: T_SelectionPayload = {
				stepName: payload.stepName,
				selectorId: payload.selectorId,
				optionId: previouslySelectedOption.id,
				isSelected: false, // считаем её выбранной - получаем её артикул
			}

			const resolvedFromPrevious = get().getResolvedBlockingArticle(
				previousPayload,
				modifications,
			)

			if (resolvedFromPrevious) return resolvedFromPrevious

			// Fallback - берём итоговый артикул из Composition Store
			// там хранится состояние ДО текущего клика
			const prevStepData =
				useComposition.getState().selectedProducts[payload.stepName]

			if (
				!Array.isArray(prevStepData) &&
				prevStepData?.products?.length === 1
			) {
				return prevStepData.products[0].article
			}

			return null
		})()

		/**
		 * Вычисляем previouslySelectedOptionId один раз до forEach -
		 * на этом этапе тоггл ещё не произошёл, поэтому option.selected
		 * содержит актуальное предыдущее значение
		 */
		const currentSelectorForUnblock = Object.values(modifications)
			.flat()
			.find((selector) => selector.selectorId === payload.selectorId)

		const previouslySelectedOptionId =
			currentSelectorForUnblock?.selectorOptions.find(
				(option) => option.selected,
			)?.id ?? null

		// Проходим по всем продуктам и снимаем блокировки/фильтрации
		const allProducts = Object.values(modifications)
			.flat()
			.flatMap((selector) => selector.selectorOptions)
			.flatMap((option) => option.products)

		allProducts.forEach((product) => {
			// Снимаем blockedBy если блокиратором был unblockingArticle
			if (product.blockedBy?.length && unblockingArticle) {
				product.blockedBy = product.blockedBy.filter((blockedObj) => {
					/**
					 * Один и тот же артикул может быть заблокирован из разных селекторов -
					 * оставляем блокировки от других селекторов нетронутыми
					 */
					if (blockedObj.selectorId !== payload.selectorId) return true

					return blockedObj.blockingArticle !== unblockingArticle
				})

				if (!product.blockedBy.length) {
					delete product.blockedBy
				}
			}

			// Снимаем filteredBy наложенный ранее выбранной опцией текущего селектора
			if (product.filteredBy?.length) {
				product.filteredBy = product.filteredBy.filter(
					(filteredObj) =>
						filteredObj.selectedOptionId !== previouslySelectedOptionId,
				)

				if (!product.filteredBy.length) {
					delete product.filteredBy
				}
			}
		})
		// #endregion

		// * Блокируем продукты по блэклистам на основе итогового блокирующего артикула --- START
		// #region
		/**
		 * Читаем blockingSelector и blockingOption напрямую из modifications
		 * а не через get() чтобы работать с актуальным состоянием клона
		 */
		const blockingSelector =
			Object.values(modifications)
				.flat()
				.find((selector) => selector.selectorId === payload.selectorId) ?? null

		const blockingOption =
			blockingSelector?.selectorOptions.find(
				(option) => option.id === payload.optionId,
			) ?? null

		/**
		 * Сначала тогглим option.selected в кликнутом селекторе -
		 * getResolvedBlockingArticle должен видеть актуальное состояние
		 */
		Object.values(modifications)
			.flat()
			.forEach((selector) => {
				if (selector.selectorId !== payload.selectorId) return

				selector.selectorOptions.forEach((option) => {
					option.selected =
						option.id === payload.optionId && !payload.isSelected
				})
			})

		/**
		 * Получаем итоговый блокирующий артикул после тогглинга.
		 * Если на шаге ещё не определён единственный артикул - blockingArticle будет null
		 * и блокировка по блэклистам не применяется
		 */
		const blockingArticle = get().getResolvedBlockingArticle(
			payload,
			modifications,
		)

		Object.values(modifications)
			.flat()
			.forEach((selector) => {
				const currentSelectorPlaceIdx = selectorIdsMap.indexOf(
					selector.selectorId,
				)

				// Работаем только с селекторами начиная с кликнутого
				if (currentSelectorPlaceIdx < clickedSelectorPlaceIdx) return

				selector.selectorOptions.forEach((option) => {
					option.products.forEach((product) => {
						/**
						 * Не блокируем продукты внутри того же селектора
						 * где была нажата кнопка
						 */
						const sameSelector =
							selector.selectorId === blockingSelector?.selectorId

						const shouldBlockProduct = sameSelector
							? false
							: get().shouldArticleBlocking({
									blockingArticle,
									productArticle: product.article,
								})

						// Блокируем только если кнопка нажата и продукт не выбран
						if (shouldBlockProduct && !option.selected) {
							const {blockingArticle: ba, blacklistArticlesBlockingGroup} =
								shouldBlockProduct

							if (!product.blockedBy) {
								product.blockedBy = []
							}

							product.blockedBy.push({
								blockingArticle: ba,
								stepName: payload.stepName,
								selectorName: blockingSelector?.selectorName ?? null,
								selectorId: blockingSelector?.selectorId ?? null,
								optionValue: blockingOption?.value ?? null,
								optionId: blockingOption?.id ?? null,
								blacklistArticlesBlockingGroup,
							})
						}

						if (!product.blockedBy?.length) {
							delete product.blockedBy
						}
					})
				})
			})
		// #endregion

		// * Фильтруем продукты внутри шага если на нём несколько селекторов --- START
		// #region
		/**
		 * Если на шаге несколько селекторов - нужно фильтровать продукты
		 * в одних селекторах по выбранным значениям в других.
		 * Например: выбрана температура 3000K → фильтруем продукты
		 * в селекторе, оставляя только те что имеют температуру 3000K
		 */
		const clickedStepSelectors = modifications[payload.stepName]

		if (clickedStepSelectors.length > 1) {
			// Сбрасываем все filteredBy перед новой фильтрацией
			clickedStepSelectors
				.flatMap((selector) =>
					selector.selectorOptions.flatMap((option) => option.products),
				)
				.forEach((product) => {
					delete product.filteredBy
				})

			clickedStepSelectors.forEach((currentSelector, _idx, selectors) => {
				const selectedData = get().getSelectedOptionValue({
					selector: currentSelector,
				})

				// Если на текущем селекторе нет выбора - не фильтруем по нему
				if (!selectedData) return

				// Все остальные селекторы шага кроме текущего
				const otherSelectors = selectors.filter(
					(selector) => selector.selectorId !== currentSelector.selectorId,
				)

				const otherSelectorsProducts = otherSelectors.flatMap((selector) =>
					selector.selectorOptions.flatMap((option) => option.products),
				)

				// Добавляем filteredBy если значение продукта не совпадает с выбранным
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
		useComposition.getState().updateTotalPrice()
		useComposition.getState().setResultAdditionalData()
		useComposition.getState().setResultCharacteristics()
	},

	// * Клик по замочку
	unlockSelector: (payload) => {
		const modifications = structuredClone({...get().modifications})
		const allSelectors = Object.values(modifications).flat()
		const targetSelector = allSelectors.find(
			(selector) => selector.selectorId === payload.selectorId,
		)

		if (!targetSelector) return

		const blockingSelectorAndOptions = new Set<T_SelectorAndOptionPair>()

		const targetProducts = targetSelector.selectorOptions.flatMap(
			(option) => option.products,
		)

		// #region Шаг 1.
		/**
		 * ! Задача 1.
		 * Проходим по всем шагам селектора который нужно разблокировать
		 * и собираем со всех заблокированных или зафильтрованных продуктов
		 * инициаторов их блокировки и фильтрации.
		 *
		 * ! Задача 2.
		 * Снимаем блокировку и фильтрацию со всех продуктов целевого селектора
		 */

		targetProducts.forEach((product) => {
			if (product.blockedBy) {
				console.log('product.blockedBy', product.blockedBy)
				// Сохраняем блокиратора
				product.blockedBy.forEach((blockedObj) => {
					blockingSelectorAndOptions.add(
						`${blockedObj.selectorId}___${blockedObj.optionId}`,
					)
				})

				// Снимаем блокировку
				delete product.blockedBy
			}

			if (product.filteredBy) {
				console.log('product.filteredBy', product.filteredBy)

				// Сохраняем фильтратора
				product.filteredBy.forEach((filter) => {
					blockingSelectorAndOptions.add(
						`${filter.selectorId}___${filter.selectedOptionId}`,
					)
				})

				// Снимаем фильтрацию
				delete product.filteredBy
			}
		})
		// #endregion

		/**
		 * В этом массиве храним объекты которые в дальнейшем будем передавать
		 * в метод setSelectedOption, для снятия блокировки и фильтрации
		 * с опций который зависит от блокиратора разблокируемого селектора
		 */
		const unblockingOptions: T_SelectionPayload[] = []

		// #region Шаг 2.
		/**
		 * Проходим по всем Опциям и определяем является ли текущая итерируемая опция
		 * блокиратором того селекта который необходимо разблокировать.
		 *
		 * ! Задача:
		 * Собрать в массив блокираторов Объекты, которые в дальнейшем будут переданы
		 * в качестве аргумента в метод setSelectedOption для разблокировки всех
		 * зависимых от неё продуктов.
		 */
		allSelectors.forEach((selector) => {
			selector.selectorOptions.forEach((option) => {
				const currentPair: T_SelectorAndOptionPair = `${selector.selectorId}___${option.id}`

				if (blockingSelectorAndOptions.has(currentPair)) {
					unblockingOptions.push({
						stepName: selector.stepName,
						selectorId: selector.selectorId,
						optionId: option.id,
						isSelected: true, // этот параметр говорит методу setSelectedOption, что кнопка нажата или опция выбрана
					})
				}
			})
		})
		// #endregion

		set({modifications})

		/**
		 * Снятие зависимых блокировок проводим через имитацию отжатия опшена/кнопки
		 * Вызываем метод setSelectedOption, передавая в него объект отжимаемого опшена.
		 * В передаваемом объекте параметр isSelected: true говорит о том, что
		 * кнопка/опшен нажата и в текущий момент отжимается пользователем.
		 * Метод setSelectedOption вызывается при каждом клике по кнопке/опшену.
		 */

		unblockingOptions.forEach((selectionObj) => {
			get().setSelectedOption(selectionObj)
		})

		// Нормализуем статусы селекторов после всех перекрёстных разблокировок
		get().normalizeSelectorStatuses()

		// Обновляем Composition Store после нормализации
		useComposition.getState().handleModificationsChange()
		useComposition.getState().updateTotalPrice()
		useComposition.getState().setResultAdditionalData()
		useComposition.getState().setResultCharacteristics()
	},

	productsWithBuiltInDriver: [],

	addProductAsWithBuiltInDriver: (payload) => {
		const {productArticle} = payload

		const currentArr = structuredClone(get().productsWithBuiltInDriver)

		if (!currentArr.includes(productArticle)) {
			set({productsWithBuiltInDriver: [...currentArr, productArticle]})
		}
	},

	showDriverStep: () => {
		const productsWithBuiltInDriver = get().productsWithBuiltInDriver
		const selectedProducts = useComposition.getState().selectedProducts

		const selectedArticles = Object.values(selectedProducts).flatMap(
			(stepData) => {
				if (Array.isArray(stepData)) return []
				return stepData.products.map((p) => p.article)
			},
		)

		const hasBuiltIn = selectedArticles.some((article) =>
			productsWithBuiltInDriver.includes(article),
		)

		return !hasBuiltIn
	},

	hasStepUnblockedSelector: (payload) => {
		return (
			payload.selectors.findIndex(
				(selector) => selector.selectorSelectedStatus !== 'blocked',
			) !== -1
		)
	},

	normalizeSelectorStatuses: () => {
		const modifications = structuredClone({...get().modifications})
		const allSelectors = Object.values(modifications).flat()

		// Находим индекс первого unselected селектора
		const firstUnselectedIdx = allSelectors.findIndex(
			(selector) => selector.selectorSelectedStatus === 'unselected',
		)

		// Если unselected не найден — ничего не делаем
		if (firstUnselectedIdx === -1) return

		// Все селекторы после первого unselected ставим в blocked
		allSelectors.forEach((selector, idx) => {
			if (idx > firstUnselectedIdx) {
				selector.selectorSelectedStatus = 'blocked'
				// Сбрасываем выбор опций у заблокированных селекторов
				selector.selectorOptions.forEach((option) => {
					option.selected = false
				})
			}
		})

		set({modifications})
	},
})

export const useConfiguration = create<T_ConfigurationSlice>()(
	devtools(store, {
		name: 'Configuration Store', // 👈 добавь имя стора чтобы в ReduxDevTools можно было на него переключиться
		enabled: true, // включаем Redux devTools для продакшена
	}),
)
