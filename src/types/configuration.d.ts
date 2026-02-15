import type {
	T_BlackList,
	T_Characteristics,
	T_Combos,
	T_Description,
	T_Files,
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
	T_Videos,
} from '@/zod'

export type T_ConfigurationSlice = {
	// #region Initial values and Setters
	steps: T_Steps
	stepsCount: T_StepsCount
	hardFilterSteps: T_HardFilterSteps
	filters: T_Filters
	characteristics: T_Characteristics
	blacklist: T_BlackList
	titles: T_Titles
	units: T_Units
	combos: T_Combos
	products: T_Products
	description: T_Description
	videos: T_Videos
	files: T_Files

	setInitData: (payload: {
		steps: T_Steps
		stepsCount: T_StepsCount
		hardFilterSteps: T_HardFilterSteps
		filters: T_Filters
		characteristics: T_Characteristics
		blacklist: T_BlackList
		titles: T_Titles
		units: T_Units
		combos: T_Combos
		products: T_Products
		description: T_Description
		videos: T_Videos
		files: T_Files
	}) => void
	// #endregion

	modifications?: T_Modifications
	createModifications: () => void

	getResolvedBlockingArticle: (
		payload: T_SelectionPayload,
		modifications: T_Modifications,
	) => T_Product['article'] | null

	getProductByArticle: (article: T_StepArticle) => T_ProductExtended | null

	getSelectorById: (payload: {selectorId: T_Id}) => T_Selector | null

	getOptionById: (payload: {optionId: T_Id}) => T_Option | null

	getSiblingsOptionsByOptionId: (payload: {optionId: T_Id}) => T_Option[]

	getSelectedOptionValue: (payload: {selector: T_Selector}) => {
		stepName: T_Selector['stepName']
		selectorId: T_Selector['selectorId']
		selectorName: T_Selector['selectorName']
		selectorCode: T_Selector['selectorCode']
		selectedValue: T_Option['value']
		selectedOptionId: T_Option['id']
	} | null

	hasSomeBlockedOptionBySelectorId: (payload: {selectorId: T_Id}) => boolean

	shouldArticleBlocking: (payload: {
		blockingArticle: T_Product['article'] | null
		productArticle: T_Product['article']
	}) =>
		| {
				blockingArticle: T_Product['article']
				blacklistArticlesBlockingGroup: Exclude<T_BlackList, null>[number]
		  }
		| false

	shouldOptionBlocking: (payload: {optionId: T_Option['id']}) => {
		shouldBlock: boolean
		blockedBy?: T_ProductExtended['blockedBy']
		filteredBy?: T_ProductExtended['filteredBy']
	}

	setSelectedOption: (payload: T_SelectionPayload) => void

	unlockSelector: (payload: {selectorId: T_Id}) => void

	productsWithBuiltInDriver: T_Product['article'][]

	addProductAsWithBuiltInDriver: (payload: {
		productArticle: T_Product['article']
	}) => void

	showDriverStep: () => boolean

	hasStepUnblockedSelector: (payload: {selectors: T_Selector[]}) => boolean

	normalizeSelectorStatuses: () => void
}

export type T_Id = string

export type T_ProductExtended = T_Product & {
	blockedBy?: {
		// Опция заблокирована этим артикулом
		blockingArticle: T_Product['article']

		// Заблокирован шагом
		stepName: T_StepName

		// Заблокирован селектом
		selectorName: T_Selector['selectorName'] | null
		selectorId: T_Selector['selectorId'] | null

		// Заблокирована значением Option
		optionValue: T_Option['value'] | null
		optionId: T_Option['id'] | null

		// заблокирован этим блэк-листом
		blacklistArticlesBlockingGroup: Exclude<T_BlackList, null>[number]
	}[]

	filteredBy?: {
		// Заблокирован шагом
		stepName: T_StepName

		// Заблокирован селектом
		selectorId: T_Selector['selectorId']
		selectorName: T_Selector['selectorName']
		selectorCode: T_Selector['selectorCode']

		// Выбранное значение
		selectedValue: T_Option['value']
		selectedOptionId: T_Option['id']
	}[]

	autoAddedProducts?: T_ProductExtended[]
}

export type T_Option = {
	id: T_Id
	value: string
	products: T_ProductExtended[]
	selected: boolean
}

export type T_Selector = {
	stepName: string
	selectorId: T_Id
	selectorName: string
	selectorCode: keyof T_Product | null
	selectorSelectedStatus: 'selected' | 'unselected' | 'blocked'
	selectorOptions: T_Option[]
}

export type T_Modifications = Record<string, T_Selector[]>

export type T_SelectionPayload = {
	stepName: T_StepName
	selectorId: T_Id
	optionId: T_Id
	isSelected: boolean
}

export type T_SelectorAndOptionPair =
	`${T_Selector['selectorId']}___${T_Option['id']}`
