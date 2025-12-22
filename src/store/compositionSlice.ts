import {create, type StateCreator} from 'zustand'
import {devtools} from 'zustand/middleware'
import generateVirtualArticle from '@/combinations/virtual_article.js'
import {useApp, useConfiguration} from '@/store'
import type {
	T_CompositionSlice,
	T_Option,
	T_ResultAdditionalData,
} from '@/types'
import type {T_Combos, T_Product} from '@/zod'

const store: StateCreator<T_CompositionSlice> = (set, get) => ({
	selectedProducts: {},
	virtualArticle: null,

	complectCount: 1,
	updateComplectCount: (payload) => {
		const pervCount = get().complectCount

		let complectCount = pervCount + payload.direction

		if (complectCount < 1) complectCount = 1

		set({complectCount})
	},

	isDotInCart: false,

	totalPrice: 0,
	updateTotalPrice: () => {
		const stepsCount = useConfiguration.getState().stepsCount
		const selectedProducts = get().getSelectedProductsExtendedStepNames()
		let totalPrice = 0

		selectedProducts.forEach((product) => {
			if (product?.price) {
				const count = stepsCount?.[product.stepName] || 1
				totalPrice += product.price * count
			}
		})

		set({totalPrice})
	},

	pushDotToCart: async () => {
		const stepsCount = useConfiguration.getState().stepsCount

		// const customName = get().customName
		// const configurationName = customName ? customName : 'Дот в сборе'
		const configurationName = 'Дот в сборе'

		const selectedProducts = get().getSelectedProductsExtendedStepNames()

		const order = {
			name: configurationName,
			image: get().resultAdditionalData.final_image,
			count: get().complectCount,
			arts: selectedProducts.map((product) => {
				const count =
					stepsCount && product.stepName ? stepsCount[product.stepName] : 1

				return {
					...product,
					art: product.article,
					count: count, // Количество отдельного артикула в составе Дота
				}
			}),
		}

		if (typeof window.addDotToCart !== 'function') {
			console.error('window.addDotToCart is not a function')
			return
		}

		try {
			const response = window.addDotToCart(order)
			const result = await response

			if (result) {
				set({isDotInCart: true})
			}
		} catch (error) {
			console.error('Error adding dot to cart:', error)
		}
	},

	getSelectedProductsExtendedStepNames: () => {
		const selectedProducts = get().selectedProducts

		return Object.entries(selectedProducts).flatMap(
			([stepName, stepData]): Array<T_Product & {stepName: string}> => {
				if (Array.isArray(stepData)) {
					return [] // пропускаем массивы строк
				}
				return stepData.products.map((p) => ({
					...p,
					stepName,
				}))
			},
		)
	},

	/**
	 * Отслеживаем modifications в Слайсе useConfiguration [name: 'Configuration Store']
	 * Вызываем везде и сразу после изменения modifications во всех Слайсах
	 */
	handleModificationsChange: () => {
		const modifications = useConfiguration.getState().modifications
		const steps = structuredClone(modifications) // ✅ Deep copy
		const selectedProducts: T_CompositionSlice['selectedProducts'] = {}

		for (const stepName in steps) {
			const selectors = steps[stepName]

			// Для одного селектора
			if (selectors.length === 1) {
				const {selectorName, selectorOptions} = steps[stepName][0]

				// Проверяем есть ли выбранные опшены
				const selectedOption: T_Option | null = get().getSelectedSingleOption({
					selectorOptions,
				})

				// Если ничего не выбрали
				if (!selectedOption) {
					selectedProducts[stepName] = {
						selector: selectorName,
						option: null,
						products: [],
					}

					continue
				}

				// Если есть выбор на шаге с одним селектором
				selectedProducts[stepName] = {
					selector: selectorName,
					option: selectedOption.value,
					products:
						selectedOption.products.length &&
						selectedOption.products[0].autoAddedProducts
							? [
									selectedOption.products[0],
									...selectedOption.products[0].autoAddedProducts,
								]
							: selectedOption.products,
				}
			} else {
				// Находим общие продукты для всех выбранных опций
				const allSelectedOptions = selectors
					.map((selector) =>
						selector.selectorOptions.find((option) => option.selected),
					)
					.filter(Boolean)

				// Получаем массивы продуктов из каждой выбранной опции
				const productArrays = allSelectedOptions.map((option) =>
					option ? option.products : [],
				)

				// Находим пересечение по id продуктов
				const commonProducts = productArrays.reduce(
					(intersection, currentProducts) => {
						return intersection.filter((product) =>
							currentProducts.some(
								(currentProduct) => currentProduct.id === product.id,
							),
						)
					},
					productArrays[0],
				)

				// Если еще ничего не выбрали
				if (!commonProducts) {
					selectedProducts[stepName] = selectors.map(
						(selector) => selector.selectorName,
					)
					continue
				}

				// Если нашли в пересечениях несколько продуктов/артикулов
				if (commonProducts.length > 1) {
					const unSelected = selectors
						.filter(
							(selector) =>
								!selector.selectorOptions.some((option) => option.selected),
						)
						.map((selector) => selector.selectorName)

					selectedProducts[stepName] = unSelected
				}

				// Если нашли один единственный артикул, то он и есть целевой
				if (commonProducts.length === 1) {
					let products = commonProducts

					if (products[0].autoAddedProducts) {
						products = [...products, ...products[0].autoAddedProducts]
					}

					selectedProducts[stepName] = {
						/**
						 * Так как продукт/артикул - один на пересечении нескольких селектов и опшенов,
						 * то не понятной кокой из выбранных ставить в свойства selector и option.
						 * Следовательно ставим их в null!
						 */
						selector: null,
						option: null,
						products: products,
					}
				}
			}
		}

		/**
		 * Генерируем виртуальные артикул (артикул дота в сборе)
		 */
		const articleArray: string[] = []
		let virtualArticle: (string | null)[] | null = null

		Object.values(selectedProducts).forEach((selectedStepData) => {
			if (!Array.isArray(selectedStepData)) {
				selectedStepData.products.forEach((product) => {
					articleArray.push(product.article)
				})
			}
		})

		try {
			if (articleArray?.length) {
				console.log(
					'\x1b[34m%s\x1b[0m',
					'Запрашиваем виртуальны артикул по списку выбранных',
					articleArray,
				)

				const articleString = generateVirtualArticle(articleArray)
				virtualArticle = articleString
					.split('-')
					.map((part) => (part === 'null' ? null : part))

				console.log(
					'\x1b[32m%s\x1b[0m',
					'Получили виртуальный артикул',
					virtualArticle,
				)
			}
		} catch (error) {
			console.error(error)
			virtualArticle = null
		}

		set({selectedProducts, virtualArticle})
	},

	getSelectedSingleOption: ({selectorOptions}) => {
		selectorOptions = selectorOptions.filter((option) => option.selected)

		return !selectorOptions.length ? null : selectorOptions[0]
	},

	resultAdditionalData: {
		files: [],
	},

	setResultAdditionalData: () => {
		const selectedProducts = get().selectedProducts

		// const combinationsArr = get().combos
		const combinations = useConfiguration.getState().combos

		const stepsAndProducts: Record<string, string> = {}

		const checkedCombs: T_Combos = []

		const resultAdditionalData: T_ResultAdditionalData = {
			files: [],
		}

		function checkCombination(
			selectedArticles: Array<string>,
			combination: Record<string, Array<string>>,
		) {
			let isMatch = true

			for (const step in combination) {
				const isIncludes = combination[step].some((article) =>
					selectedArticles.includes(article),
				)
				if (!isIncludes) isMatch = false
			}

			return isMatch
		}

		// Собираем артикулы на выбранных шагах
		Object.entries(selectedProducts).forEach(([stepName, selectedData]) => {
			if (Array.isArray(selectedData)) return

			selectedData.products.forEach((product) => {
				if (!stepsAndProducts[stepName]) {
					stepsAndProducts[stepName] = product.article
				}
			})
		})

		// Фильтруем комбинации
		combinations?.forEach((combination) => {
			if (
				typeof combination.combo === 'number' ||
				typeof combination.combo === 'string' ||
				Array.isArray(combination.combo)
			) {
				return
			}

			const isMatch = checkCombination(
				Object.values(stepsAndProducts),
				combination.combo,
			)

			if (isMatch) {
				checkedCombs.push(combination)
			}
		})

		checkedCombs
			.sort((a, b) => {
				const a1 = Object.keys(a.combo).length
				const b1 = Object.keys(b.combo).length
				return b1 - a1
			})
			.forEach((i) => {
				if (
					!resultAdditionalData.light_flow &&
					i.light_flow &&
					typeof i.light_flow === 'number'
				) {
					resultAdditionalData.light_flow = i.light_flow
				}

				if (
					!resultAdditionalData.final_image &&
					i.final_image &&
					typeof i.final_image === 'string'
				) {
					resultAdditionalData.final_image = i.final_image
				}

				if (
					!resultAdditionalData.final_drawing &&
					i.final_drawing &&
					typeof i.final_drawing === 'string'
				) {
					resultAdditionalData.final_drawing = i.final_drawing
				}

				if (i.files && Array.isArray(i.files)) {
					resultAdditionalData.files = [
						...resultAdditionalData.files,
						...i.files,
					]
				}
			})

		return set({resultAdditionalData})
	},

	resultCharacteristics: {},

	resetComposition: () => {
		set({
			complectCount: 1,
			isDotInCart: false,
			totalPrice: 0,
		})
	},

	setResultCharacteristics: () => {
		const characteristics = useConfiguration.getState().characteristics
		const selectedProducts = get().selectedProducts
		let resultCharacteristics: Record<string, string> = {}
		let isThereIPClass = false

		// обходим характеристики по шагам
		for (const stepName in characteristics) {
			// Получаем массивы выбранных на шаге артикулов
			const selectedArticles = getSelectedArticlesByStep(stepName)

			// получаем характеристику из выбранных артикулов
			const characteristicsObj = getCharacteristicsBySelectedArticles(
				selectedArticles,
				characteristics[stepName],
			)

			// Добавляем характеристики в итоговый объект
			resultCharacteristics = Object.assign(
				resultCharacteristics,
				characteristicsObj,
			)
		}

		function getSelectedArticlesByStep(stepName: string): string[] {
			const stepData = selectedProducts[stepName]

			if (Array.isArray(stepData)) return []

			return stepData.products.map((product) => product.article)
		}

		function getCharacteristicsBySelectedArticles(
			articlesArr: string[],
			characteristicsObj: Record<string, string>,
		): Record<string, string> {
			const productsAll = useConfiguration.getState().products
			const units = useConfiguration.getState().units

			const resCharacteristics: Record<string, string> = {}

			// обходим характеристики
			for (const characteristic in characteristicsObj) {
				const unit = units?.[characteristic]

				// обходим выбранные на шагах артикулы
				for (const article of articlesArr) {
					const productCharacteristicValue =
						productsAll?.[article][characteristic as keyof T_Product]

					const property = characteristicsObj[characteristic]

					if (productCharacteristicValue) {
						let value: string

						// Для IP (Степень пыле-влагозащищенности сначала идут единицы)
						if (characteristic === 'ip_class') {
							value = `${unit ? `${unit}` : ''}${productCharacteristicValue}`

							// Помечаем флаг для IP класса
							isThereIPClass = true
						} else if (characteristic === 'protection_class_ik') {
							value = `${unit ? `${unit}` : ''}${productCharacteristicValue}`
						} else {
							value = `${productCharacteristicValue}${unit ? `${unit}` : ''}`
						}

						// Записываем характеристику только один раз
						if (!resCharacteristics[property]) {
							resCharacteristics[property] = value
						}
					}
				}
			}

			for (const characteristic in characteristicsObj) {
				// Характеристики ip_class (степень пыле-влагозащищенности) может не быть
				if (characteristic === 'ip_class') continue

				const prop = characteristicsObj[characteristic]

				if (
					!resCharacteristics[prop] &&
					useApp.getState().userStatus === 'admin'
				) {
					console.log(
						'\x1b[31m%s\x1b[0m',
						`Для артикулов ${articlesArr} не указана характеристика ${characteristic} - ${prop}`,
					)
				}
			}

			return resCharacteristics
		}

		/**
		 * Если нигде не указан IP (степень пыле-влагозащищенности),
		 * то указываем дефолтное значение.
		 *
		 * Устанавливаем только в том случае, если выбрана
		 * хотя бы одна характеристика
		 */
		//
		if (!isThereIPClass && Object.keys(resultCharacteristics).length) {
			resultCharacteristics['Степень пыле-влагозащищенности'] = 'IP20'
		}

		set({resultCharacteristics})
	},

	// #region Виртуальный артикул
	/**
	 * Делала Оля Кондратенко - kondratenko@technolight.ru
	 * https://bt24.ddns.net/company/personal/user/13449/
	 *
	 * Вся логика по пути src/combinations
	 */
	emptyResult: () => ({
		image: null,
		drawing: null,
		lightFlow: null,
		files: [],
	}),

	getResultData: () => {
		const selectedProducts = get().selectedProducts
		const combos = useConfiguration.getState().combos

		// 1. Быстрая проверка
		if (!selectedProducts || !combos) {
			return get().emptyResult()
		}

		// 2. Собираем выбранные артикулы
		const selectedArticlesByStep =
			get().collectSelectedArticles(selectedProducts)

		// 3. Находим и сортируем подходящие комбинации
		const relevantCombos = combos
			.filter((combo) => get().comboMatches(combo, selectedArticlesByStep))
			.sort((a, b) => get().getComboStepCount(b) - get().getComboStepCount(a))

		// 4. Извлекаем результат
		return get().extractRelevantData(relevantCombos)
	},

	collectSelectedArticles: (selectedProducts) => {
		const articles: Record<string, string[]> = {}

		for (const [stepName, stepData] of Object.entries(selectedProducts)) {
			if (stepName === 'virtualArticle') continue

			if (Array.isArray(stepData)) {
				articles[stepName] = stepData.filter(Boolean) as string[]
			} else if (stepData?.products) {
				articles[stepName] = stepData.products
					.map((p) => p?.article)
					.filter(Boolean) as string[]
			}
		}

		return articles
	},

	comboMatches: (combo, selectedArticles) => {
		if (!combo?.combo || typeof combo.combo !== 'object') return false

		for (const [step, requiredArticles] of Object.entries(
			combo.combo as Record<string, string[]>,
		)) {
			const userArticles = selectedArticles[step] || []
			const hasMatch = (requiredArticles as string[]).some((req) =>
				userArticles.includes(req),
			)

			if (!hasMatch) return false
		}

		return true
	},

	getComboStepCount: (combo) => Object.keys(combo.combo || {}).length,

	extractRelevantData: (combos) => {
		const result = get().emptyResult()

		for (const combo of combos) {
			if (!result.image && combo.final_image) result.image = combo.final_image
			if (!result.drawing && combo.final_drawing)
				result.drawing = combo.final_drawing
			if (!result.lightFlow && combo.light_flow)
				result.lightFlow = combo.light_flow
			if (combo.files) result.files.push(...combo.files)
		}

		return result
	},
	// #endregion
})

export const useComposition = create<T_CompositionSlice>()(
	devtools(store, {
		name: 'Composition Store', // 👈 добавь имя стора чтобы в ReduxDevTools можно было на него переключиться
		enabled: true, // включаем Redux devTools для продакшена
	}),
)
