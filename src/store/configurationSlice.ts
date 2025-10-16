import {create, type StateCreator} from 'zustand'
import {createJSONStorage, devtools, persist} from 'zustand/middleware'
import type {T_ConfigurationSlice} from '../types'

// const store: StateCreator<T_ConfigurationSlice> = (set, get) => ({})
const store: StateCreator<T_ConfigurationSlice> = (set) => ({
	blacklist: null,
	setBlackList: (payload) => {
		set({blacklist: payload})
	},
})

export const useConfiguration = create<T_ConfigurationSlice>()(
	devtools(
		persist(store, {
			name: 'configurator-storage',
			storage: createJSONStorage(() => localStorage),
		}),
		{name: 'Configuration Store'}, // 👈 добавь имя стора чтобы в ReduxDevTools можно было на него переключиться
	),
)
