import type {T_BlackList} from '../zod'

export type T_ConfigurationSlice = {
	blacklist: T_BlackList
	setBlackList: (payload: T_BlackList) => void
}
