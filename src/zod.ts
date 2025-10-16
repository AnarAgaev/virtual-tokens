import {z} from 'zod'

const blacklists = z.array(z.array(z.string()))
export type T_BlackList = z.infer<typeof blacklists | null>

// #region Initial data
export const InitDataContract = z.object({
	blacklists,
})
// #endregion
