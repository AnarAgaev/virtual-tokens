import {z} from 'zod'

// #region Schemas
const steps = z.record(
	z.string(), // ключи: динамические строковые имена шагов
	z.array(z.array(z.string().nullable())),
)
export type T_Steps = z.infer<typeof steps> | null

const stepsCount = z.record(z.string(), z.number())
export type T_StepsCount = z.infer<typeof stepsCount> | null

const filters = z.record(z.string(), z.record(z.string(), z.string()))
export type T_Filters = z.infer<typeof filters> | null

const characteristics = z.record(z.string(), z.record(z.string(), z.string()))
export type T_Characteristics = z.infer<typeof characteristics> | null

const blacklists = z.array(z.array(z.string()))
export type T_BlackList = z.infer<typeof blacklists> | null

const titles = z.record(z.string(), z.string())
export type T_Titles = z.infer<typeof titles> | null

const units = z.record(z.string(), z.string())
export type T_Units = z.infer<typeof units> | null

const comboFile = z.object({
	name: z.string(),
	file: z.string(),
})

const combo = z.object({
	combo: z.record(z.string(), z.array(z.string())),
	name: z.string().optional(),
	light_flow: z.number().optional(),
	files: z.array(comboFile).optional(),
	final_image: z.string().optional(),
	final_drawing: z.string().optional(),
})
const combos = z.array(combo)
export type T_Combos = z.infer<typeof combos> | null
// #endregion

// #region Initial data
export const InitDataContract = z.object({
	id: z.number(),
	height_calc_type: z.string(),
	steps,
	stepsCount,
	hardFilterSteps: z.array(z.unknown()),
	filters,
	characteristics,
	blacklists,
	titles,
	units,
	combos,
})
export type T_InitData = z.infer<typeof InitDataContract>
// #endregion
