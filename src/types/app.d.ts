export type T_AppSlice = {
	userStatus: 'admin' | 'manager' | 'user'

	requestInitData: () => void

	activeTab: T_ActiveTab
	setActiveTab: (payload: {tabType: T_ActiveTab}) => void
}

export type T_ActiveTab = 'configuration' | 'description'
