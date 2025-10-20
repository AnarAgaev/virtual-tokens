// import {type ErrorMessageOptions, generateErrorMessage} from 'zod-error'
import {create, type StateCreator} from 'zustand'
import {createJSONStorage, devtools, persist} from 'zustand/middleware'
import {formatZodErrors} from '@/helpers'
import {useConfiguration} from '@/store'
import type {T_AppSlice} from '@/types'
import {InitDataContract} from '@/zod'

const store: StateCreator<T_AppSlice> = () => ({
	requestInitData: async () => {
		try {
			const apiLink = 'mocks/dots.json'

			if (!apiLink) {
				throw new Error(
					`Не указан API URL получения инит данных. Текущее значение apiLink: ${apiLink}`,
				)
			}

			const res = await fetch(apiLink)

			if (!res.ok) {
				throw new Error(
					`Ошибка fetch запроса Получить инит данные! URL: ${apiLink}`,
				)
			}

			const data = await res.json()
			const safeResponse = InitDataContract.passthrough().safeParse(data)

			if (!safeResponse.success) {
				const formattedErrors = safeResponse.error.format()
				console.log(formatZodErrors(formattedErrors).join('\n'))
				throw new Error('Zod contract Error')
			}

			// Set init data
			useConfiguration.getState().setSteps(safeResponse.data.steps)
			useConfiguration.getState().setStepsCount(safeResponse.data.stepsCount)
			useConfiguration
				.getState()
				.setHardFilterSteps(safeResponse.data.hardFilterSteps)
			useConfiguration.getState().setFilters(safeResponse.data.filters)
			useConfiguration
				.getState()
				.setCharacteristics(safeResponse.data.characteristics)
			useConfiguration.getState().setBlackList(safeResponse.data.blacklists)
			useConfiguration.getState().setTitles(safeResponse.data.titles)
			useConfiguration.getState().setUnits(safeResponse.data.units)
			useConfiguration.getState().setCombos(safeResponse.data.combos)
			useConfiguration.getState().setProducts(safeResponse.data.products)

			// Создаем абстракцию с селектами/кнопками для удобства работы
			useConfiguration.getState().createModifications()
		} catch (error) {
			console.error(error)
		}
	},
})

export const useApp = create<T_AppSlice>()(
	devtools(
		persist(store, {
			name: 'app-storage',
			storage: createJSONStorage(() => localStorage),
		}),
		{name: 'App Store'}, // 👈 добавь имя стора чтобы в ReduxDevTools можно было на него переключиться
	),
)
