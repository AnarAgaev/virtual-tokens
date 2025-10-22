import {z} from 'zod'

// #region Schemas
const steps = z.record(
	z.string(), // ключи: динамические строковые имена шагов
	z.array(z.array(z.string().nullable())),
)
export type T_Steps = z.infer<typeof steps> | null
type NonNullSteps = Exclude<T_Steps, null>
export type T_StepArticle = NonNullSteps[string][number][number]
export type T_StepName = keyof NonNullSteps

const stepsCount = z.record(z.string(), z.number())
export type T_StepsCount = z.infer<typeof stepsCount> | null

const hardFilterSteps = z.array(z.string())
export type T_HardFilterSteps = z.infer<typeof hardFilterSteps> | null

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

const product = z.object({
	id: z.number(),
	article: z.string(),
	title: z.string(),
	ip_class: z.number().nullable(),
	price: z.number(),
	old_price: z.union([z.number(), z.null()]),
	sale: z.union([z.boolean(), z.null()]),
	image: z.string(),
	available: z.boolean(),
	height_in_assembly: z.number(),
	color_rendering_index: z.union([z.number(), z.string()]).nullable(),
	lamp_style: z.string().nullable().optional(),
	frame_type: z.string().optional(),
	armature_color: z.string(),
	power: z.number().nullable(),
	light_temperatures: z.string().nullable(),
	light_angle: z.number().nullable().optional(),
	ugr: z.string(),
	link: z.string(),
	input_voltage_v: z.union([z.number(), z.string()]).nullable().optional(),
	komplektaciya: z.string().nullable().optional(),
	tip_upravleniya: z.string().nullable().optional(),
	form: z.string().nullable().optional(),
})

export type T_Product = z.infer<typeof product>

const products = z.record(z.string(), product)
export type T_Products = z.infer<typeof products> | null
// #endregion

// #region Initial data
export const InitDataContract = z.object({
	id: z.number(),
	height_calc_type: z.string(),
	steps,
	stepsCount,
	hardFilterSteps,
	filters,
	characteristics,
	blacklists,
	titles,
	units,
	combos,
	products,
})
export type T_InitData = z.infer<typeof InitDataContract>
// #endregion
