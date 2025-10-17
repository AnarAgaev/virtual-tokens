import {create, type StateCreator} from 'zustand'
import {createJSONStorage, devtools, persist} from 'zustand/middleware'
import type {T_ConfigurationSlice} from '@/types'
import type {
	T_BlackList,
	T_Characteristics,
	T_Combos,
	T_Filters,
	T_Steps,
	T_StepsCount,
	T_Titles,
	T_Units,
} from '@/zod'

const store: StateCreator<T_ConfigurationSlice> = (set) => ({
	steps: null,
	setSteps: (payload: T_Steps) => set({steps: payload}),

	stepsCount: null,
	setStepsCount: (payload: T_StepsCount) => set({stepsCount: payload}),

	filters: null,
	setFilters: (payload: T_Filters) => set({filters: payload}),

	characteristics: null,
	setCharacteristics: (payload: T_Characteristics) =>
		set({characteristics: payload}),

	blacklist: null,
	setBlackList: (payload: T_BlackList) => set({blacklist: payload}),

	titles: null,
	setTitles: (payload: T_Titles) => set({titles: payload}),

	units: null,
	setUnits: (payload: T_Units) => set({units: payload}),

	combos: null,
	setCombos: (payload: T_Combos) => set({combos: payload}),
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
