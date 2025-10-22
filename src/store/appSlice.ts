// import {type ErrorMessageOptions, generateErrorMessage} from 'zod-error'
import {create, type StateCreator} from 'zustand'
import {devtools} from 'zustand/middleware'
import {formatZodErrors} from '@/helpers'
import {useConfiguration} from '@/store'
import type {T_AppSlice} from '@/types'
import {InitDataContract} from '@/zod'

const store: StateCreator<T_AppSlice> = () => ({
	requestInitData: async () => {
		try {
			//! Временная логика для тестирования --- START
			const apiLinkFromGetParam = window.location.search
				?.split('?')
				?.filter(Boolean)[0]
				?.split('&')
				?.filter((getParm) => getParm.includes('url'))[0]
				?.split('=')[1]

			const normalizeUrl = (url: string) => {
				if (!url) return null

				// Если URL уже содержит протокол, возвращаем как есть
				if (url.startsWith('http://') || url.startsWith('https://')) {
					return url
				}

				// Добавляем протокол по умолчанию
				return `https://${url}`
			}

			const apiLink = normalizeUrl(apiLinkFromGetParam) ?? 'mocks/dots.json'
			//! Временная логика для тестирования --- END

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
		store,
		{name: 'App Store'}, // 👈 добавь имя стора чтобы в ReduxDevTools можно было на него переключиться
	),
)
