import type {
	T_BlackList,
	T_Characteristics,
	T_Combos,
	T_Filters,
	T_HardFilterSteps,
	T_Product,
	T_Products,
	T_StepArticle,
	T_Steps,
	T_StepsCount,
	T_Titles,
	T_Units,
} from '@/zod'

export type T_ConfigurationSlice = {
	steps: T_Steps
	setSteps: (payload: T_Steps) => void

	stepsCount: T_StepsCount
	setStepsCount: (payload: T_StepsCount) => void

	hardFilterSteps: T_HardFilterSteps
	setHardFilterSteps: (payload: T_HardFilterSteps) => void

	filters: T_Filters
	setFilters: (payload: T_Filters) => void

	characteristics: T_Characteristics
	setCharacteristics: (payload: T_Characteristics) => void

	blacklist: T_BlackList
	setBlackList: (payload: T_BlackList) => void

	titles: T_Titles
	setTitles: (payload: T_Titles) => void

	units: T_Units
	setUnits: (payload: T_Units) => void

	combos: T_Combos
	setCombos: (payload: T_Combos) => void

	products: T_Products
	setProducts: (payload: T_Products) => void

	modifications?: T_Modifications
	createModifications: () => void

	getProductByArticle: (article: T_StepArticle) => T_Product | null
}

export type T_Modifications = Record<
	string,
	{
		selectorName: string
		selectorCode: keyof T_Product | null
		selectorOptionsProducts: {
			articles: T_Product[]
			selected: boolean
			value: string
		}[]
	}[]
>
