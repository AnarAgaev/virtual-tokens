export type T_ConfigurationSlice = {
	steps: T_Steps
	setSteps: (payload: T_Steps) => void

	stepsCount: T_StepsCount
	setStepsCount: (payload: T_StepsCount) => void

	filters: T_Filters
	setFilters: (payload: T_Filters) => void

	characteristics: T_Characteristics
	setCharacteristics: (payload: T_Characteristics) => void

	blacklist: T_BlackList
	setBlackList: (payload: T_BlackList) => void

	titles: T_Titles
	setTitles: (payload: T_Titles) => void

	units: T_Units
	setUnits: (payload: T_Units) => void

	combos: T_Combos
	setCombos: (payload: T_Combos) => void
}
