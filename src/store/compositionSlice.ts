import {create, type StateCreator} from 'zustand'
import {devtools} from 'zustand/middleware'
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

				if (selectedOption) {
					selectedProducts[stepName] = {
						selector: selectorName,
						option: selectedOption.value,
						product: selectedOption.products[0],
					}
				}
			} else {
				// Для каскадного селектора с фильтрацией
			}

			set({selectedProducts})
		}
	},

	getSelectedSingleOption: ({selectorOptions}) => {
		selectorOptions = selectorOptions.filter((option) => option.selected)

		return !selectorOptions.length ? null : selectorOptions[0]
	},
})

export const useComposition = create<T_CompositionSlice>()(
	devtools(
		store,
		{name: 'Composition Store'}, // 👈 добавь имя стора чтобы в ReduxDevTools можно было на него переключиться
	),
)
