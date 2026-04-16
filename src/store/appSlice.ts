// import {type ErrorMessageOptions, generateErrorMessage} from 'zod-error'
import {create, type StateCreator} from 'zustand'
import {devtools} from 'zustand/middleware'
import {formatZodErrors, getUrlParam, logExtraFields} from '@/helpers'
import {useConfiguration} from '@/store'
import type {T_AppSlice} from '@/types'
import {InitDataContract} from '@/zod'

const store: StateCreator<T_AppSlice> = (set) => ({
	userStatus: 'user',

	requestInitData: async () => {
		try {
			// //! Временная логика для тестирования --- START
			// const apiLinkFromGetParam = window.location.search
			// 	?.split('?')
			// 	?.filter(Boolean)[0]
			// 	?.split('&')
			// 	?.filter((getParm) => getParm.includes('url'))[0]
			// 	?.split('=')[1]

			// const normalizeUrl = (url: string) => {
			// 	if (!url) return null

			// 	// Если URL уже содержит протокол, возвращаем как есть
			// 	if (url.startsWith('http://') || url.startsWith('https://')) {
			// 		return url
			// 	}

			// 	// Добавляем протокол по умолчанию
			// 	return `https://${url}`
			// }

			// const apiLink =
			// 	normalizeUrl(apiLinkFromGetParam) ?? 'mocks/virtual-token.json'
			// //! Временная логика для тестирования --- END

			const apiLink = window.virtualTokenApiLink

			if (!apiLink) {
				throw new Error(
					`Не указан API URL получения инит данных. Неправильная переменная [window.virtualTokenApiLink]`,
				)
			}

			// apiLink = 'mocks/dot_3.json'
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
				if (getUrlParam('status') === 'admin') {
					console.log(formatZodErrors(formattedErrors).join('\n'))
				}
				throw new Error('Zod contract Error')
			}

			// Set init data
			useConfiguration.getState().setInitData({
				steps: safeResponse.data.steps,
				stepsCount: safeResponse.data.stepsCount,
				hardFilterSteps: safeResponse.data.hardFilterSteps,
				filters: safeResponse.data.filters,
				characteristics: safeResponse.data.characteristics,
				blacklist: safeResponse.data.blacklists,
				titles: safeResponse.data.titles,
				units: safeResponse.data.units,
				combos: safeResponse.data.combos,
				products: safeResponse.data.products,
				description: safeResponse.data.description,
				videos: safeResponse.data.videos,
				files: safeResponse.data.files,
				shortTitles: safeResponse.data.shortTitles,
			})

			// #region Определяем тип пользователя
			let userStatus: T_AppSlice['userStatus'] = 'user'

			if (safeResponse.data.is_admin) {
				userStatus = 'admin'
			}

			const userStatusFromUrl = getUrlParam('status')

			if (
				userStatusFromUrl &&
				(userStatusFromUrl === 'admin' ||
					userStatusFromUrl === 'manager' ||
					userStatusFromUrl === 'user')
			) {
				userStatus = userStatusFromUrl
			}

			set({userStatus})
			// #endregion

			// #region Проверяем новые свойства в API данных
			logExtraFields(
				safeResponse.data,
				InitDataContract,
				'',
				userStatus === 'admin',
			)
			// #endregion

			// Создаем абстракцию с селектами/кнопками для удобства работы
			useConfiguration.getState().createModifications()
		} catch (error) {
			console.error(error)
		}
	},

	activeTab: 'configuration',
	setActiveTab: (payload) => set({activeTab: payload.tabType}),
})

export const useApp = create<T_AppSlice>()(
	devtools(
		store,
		{name: 'App Store'}, // 👈 добавь имя стора чтобы в ReduxDevTools можно было на него переключиться
	),
)
