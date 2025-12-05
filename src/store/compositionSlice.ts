import {create, type StateCreator} from 'zustand'
import {devtools} from 'zustand/middleware'
import generateVirtualArticle from '@/combinations/virtual_article.js'
import {useConfiguration} from '@/store'
import type {T_CompositionSlice, T_Option} from '@/types'

const store: StateCreator<T_CompositionSlice> = (set, get) => ({
	selectedProducts: {},

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

		const target = []

		console.log('selectedProducts')

		// for (const stepName in selectedProducts) {
		// 	const targetObj = selectedProducts[stepName]

		// 	console.log('stepName', stepName)
		// }

		Object.values(selectedProducts).forEach((obj) => {
			if (!Array.isArray(obj)) {
				obj.products.forEach((product) => {
					target.push(product.article)
				})
			}
		})

		try {
			if (target?.length) {
				console.log('****Pushed to the generator data', target)
				const res = generateVirtualArticle(target)
				console.log('\x1b[32m%s\x1b[0m', "Wow we're getting results", res)
			}
		} catch (error) {
			console.log(error)
			console.log('\x1b[31m%s\x1b[0m', "I don't have enough articles")
		}

		set({selectedProducts})
	},

	getSelectedSingleOption: ({selectorOptions}) => {
		selectorOptions = selectorOptions.filter((option) => option.selected)

		return !selectorOptions.length ? null : selectorOptions[0]
	},
})

export const useComposition = create<T_CompositionSlice>()(
	devtools(store, {
		name: 'Composition Store', // 👈 добавь имя стора чтобы в ReduxDevTools можно было на него переключиться
		enabled: true, // включаем Redux devTools для продакшена
	}),
)
