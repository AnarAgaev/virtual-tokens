import type {T_Selector} from '@/types/configuration'

export type T_CompositionSlice = {
	selectedProducts: {
		/**
		 * В имени свойства - имя шага
		 *
		 * В значении либо/либо:
		 * 1. для шагов с несколькими селекторами - список селекторов которые ЕЩЕ НЕ ВЫБРАНЫ
		 * 2. для шагов с одним селектором - указанные ниже сигнатура с пустым массивом выбранных продуктов
		 */
		[key: string]:
			| {
					selector: T_Selector['selectorName'] | null
					option: T_Option['T_Option'] | null
					products: T_Product[]
			  }
			| Array<T_Selector['selectorName']>
	}

	/**
	 * Отслеживаем modifications в Слайсе useConfiguration [name: 'Configuration Store']
	 * Вызываем везде и сразу после изменения modifications во всех Слайсах
	 */
	handleModificationsChange: () => void

	getSelectedSingleOption: (payload: {
		selectorOptions: T_Option[]
	}) => T_Option | null

	resultAdditionalData: T_ResultAdditionalData
	setResultAdditionalData: () => void

	resultCharacteristics: Record<string, string>
	setResultCharacteristics: () => void

	// #region Виртуальный артикул
	virtualArticle: (null | string)[] | null

	emptyResult: () => T_ResultData

	getResultData: () => T_ResultData

	collectSelectedArticles: (
		selectedProducts: T_CompositionSlice['selectedProducts'],
	) => T_SelectedArticles

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	comboMatches: (combo: any, selectedArticles: T_SelectedArticles) => void

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	getComboStepCount: (combo: any) => number

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	extractRelevantData: (combos: any[]) => T_ResultData
	// #endregion
}

export type T_SelectedArticles = Record<string, string[]>

export type T_ResultData = {
	image: string | null
	drawing: string | null
	lightFlow: number | null
	files: Array<{name: string; file: string}>
}

export type T_ResultAdditionalData = {
	light_flow?: number
	final_image?: string
	final_drawing?: string
	files: Record<string, string>[]
}
