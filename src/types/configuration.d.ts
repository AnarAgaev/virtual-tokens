import type {
	T_BlackList,
	T_Characteristics,
	T_Combos,
	T_Filters,
	T_HardFilterSteps,
	T_Product,
	T_Products,
	T_StepArticle,
	T_StepName,
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

	setSelectedOption: (selected: {
		stepName: T_StepName
		selectorId: T_Id
		optionId: T_Id
	}) => void

	shouldBlockOption: (payload: {
		blockingArticles: T_Product['article'][]
		maybeBlocked: T_Product['article'][]
		blacklists: T_BlackList
		blockingSelector: T_Selector | null
	}) =>
		| {
				blockingArticle: T_Product['article']
				shouldBlockedArticle: T_Product['article']
				blockListArray: Exclude<T_BlackList, null>[number]
		  }[]
		| false

	getSelectorById: (payload: {selectorId: T_Id}) => T_Selector | null

	getOptionById: (payload: {optionId: T_Id}) => T_Option | null

	getSiblingsOptionsByOptionId: (payload: {optionId: T_Id}) => T_Option[]
}

export type T_Id = string

export type T_Option = {
	id: T_Id
	value: string
	products: T_Product[]
	selected: boolean
	blockedBy?: {
		// Опция заблокирована этим артикулом
		article: string

		// Список артикулов в массиве из опции которая заблокировала
		// в том числе, содержит блокирующий article (предыдущее свойство)
		optionArticles: string[]

		// Заблокирован шагом
		stepName: T_StepName

		// Заблокирован селектом
		selectorName: T_Selector['selectorName'] | null
		selectorId: T_Selector['selectorId'] | null

		// Заблокирована значением Option
		optionValue: T_Option['value'] | null
		optionId: T_Option['id'] | null

		// заблокирован этим блэк-листом
		byBlocklist: Exclude<T_BlackList, null>[number]
	}
}

export type T_Selector = {
	selectorId: T_Id
	selectorName: string
	selectorCode: keyof T_Product | null
	selectorOptions: T_Option[]
}

export type T_Modifications = Record<string, T_Selector[]>
