import {create, type StateCreator} from 'zustand'
import {createJSONStorage, devtools, persist} from 'zustand/middleware'
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
				const selectorOptionsProducts = stepArticles.map(([code]) => {
					const product = code ? get().getProductByArticle(code) : null

					return {
						articles: product ? [product] : [],
						selected: !code,
						value: code ? 'Да' : 'Нет',
					}
				})

				modifications[stepName] = [
					{
						selectorName: stepName,
						selectorCode: null,
						selectorOptionsProducts,
					},
				]

				continue
			}

			// modifications[stepName] = Object.entries(selectorSections).map(
			// 	([selectorCode, selectorName]) => {
			// 		const key = selectorCode as keyof T_Product

			// 		const optionValues = stepArticles.flat().map((article) => {
			// 			const value = get().getProductByArticle(article)
			// 			return value[key]
			// 		})

			// 		const options = Array.from(new Set(optionValues))

			// 		return {
			// 			selectorName,
			// 			selectorCode: key,
			// 			selectorOptionsProducts: options.map((option) => {
			// 				const articles = stepArticles.flat().filter((article) => {
			// 					const product = get().getProductByArticle(article)
			// 					return product[key] === option
			// 				})
			// 				return {
			// 					articles: articles.map((article) =>
			// 						get().getProductByArticle(article),
			// 					),
			// 					selected: false,
			// 					value: option,
			// 				}
			// 			}),
			// 		}
			// 	},
			// )

			modifications[stepName] = Object.entries(selectorSections).map(
				([code, name]) => {
					const key = code as keyof T_Product
					const products = stepArticles
						.flat()
						.map((a) => get().getProductByArticle(a ?? ''))
						.filter((p): p is T_Product => !!p)

					return {
						selectorName: name,
						selectorCode: key,
						selectorOptionsProducts: [
							...new Set(products.map((p) => String(p[key] ?? ''))),
						]
							.filter(Boolean)
							.map((value) => ({
								value,
								selected: false,
								articles: products.filter(
									(p) => String(p[key] ?? '') === value,
								),
							})),
					}
				},
			)
		}

		set({modifications})
	},
})

export const useConfiguration = create<T_ConfigurationSlice>()(
	devtools(
		persist(store, {
			name: 'configurator-storage',
			storage: createJSONStorage(() => localStorage),
		}),
		{name: 'Configuration Store'}, // 👈 добавь имя стора чтобы в ReduxDevTools можно было на него переключиться
	),
)
