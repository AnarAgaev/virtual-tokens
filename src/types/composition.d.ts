export type T_CompositionSlice = {
	selectedProducts: {
		// В имени свойства - имя шага
		[key: string]:
			| {
					selector: T_Selector['selectorName'] | null
					option: T_Option['T_Option'] | null
					products: T_Product[]
			  }
			| Array<T_Selector['selectorName']>
	}

	virtualArticle: (null | string)[] | null

	/**
	 * Отслеживаем modifications в Слайсе useConfiguration [name: 'Configuration Store']
	 * Вызываем везде и сразу после изменения modifications во всех Слайсах
	 */
	handleModificationsChange: () => void

	getSelectedSingleOption: (payload: {
		selectorOptions: T_Option[]
	}) => T_Option | null
}
