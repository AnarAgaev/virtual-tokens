export type T_CompositionSlice = {
	selectedProducts: {
		// В имени свойства - имя шага
		[key: string]: {
			selector: T_Selector['selectorName']
			option: T_Option['T_Option']
			product: T_Product
		}
	}

	/**
	 * Отслеживаем modifications в Слайсе useConfiguration [name: 'Configuration Store']
	 * Вызываем везде и сразу после изменения modifications во всех Слайсах
	 */
	handleModificationsChange: () => void

	getSelectedSingleOption: (payload: {selectorOptions: T_Option[]}) => T_Option | null
}
