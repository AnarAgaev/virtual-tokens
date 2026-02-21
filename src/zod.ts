import {z} from 'zod'

// #region Schemas
const steps = z
	.record(
		z
			.string()
			.min(1, 'Название шага не может быть пустым'), // ключи: динамические строковые имена шагов
		z
			.array(
				z
					.array(
						z
							.string()
							.nullable()
							.refine(
								(val) => val !== '',
								'Артикул не может быть пустой строкой',
							),
					)
					.min(1, 'Внутренний массив артикулов не может быть пустым'),
			)
			.min(1, 'Массив вариантов выбора не может быть пустым'),
	)
	.refine(
		(steps) => Object.keys(steps).length > 0,
		'Должен быть хотя бы один шаг конфигуратора',
	)
export type T_Steps = z.infer<typeof steps> | null
type NonNullSteps = Exclude<T_Steps, null>
export type T_StepArticle = NonNullSteps[string][number][number]
export type T_StepName = keyof NonNullSteps

const stepsCount = z
	.record(
		z.string().min(1, 'Название шага не может быть пустым'),
		z
			.number()
			.int()
			.nonnegative('Количество шагов не может быть отрицательным'),
	)
	.refine(
		(counts) => Object.keys(counts).length > 0,
		'Должны быть указаны количества для всех шагов',
	)
export type T_StepsCount = z.infer<typeof stepsCount> | null

const hardFilterSteps = z.array(
	z.string().min(1, 'Название шага для жестких фильтров не может быть пустым'),
)
export type T_HardFilterSteps = z.infer<typeof hardFilterSteps> | null

const filters = z.record(
	z.string().min(1, 'Название шага для фильтров не может быть пустым'),
	z.record(
		z.string().min(1, 'Ключ фильтра не может быть пустым'),
		z.string().min(1, 'Название фильтра не может быть пустым'),
	),
)
export type T_Filters = z.infer<typeof filters> | null

const characteristics = z.record(
	z.string().min(1, 'Название шага для характеристик не может быть пустым'),
	z.record(
		z.string().min(1, 'Ключ характеристики не может быть пустым'),
		z.string().min(1, 'Название характеристики не может быть пустым'),
	),
)
export type T_Characteristics = z.infer<typeof characteristics> | null

const blacklists = z.array(
	z
		.array(z.string().min(1, 'Артикул в черном списке не может быть пустым'))
		.min(2, 'В черном списке должно быть хотя бы 2 несовместимых артикула'),
)
export type T_BlackList = z.infer<typeof blacklists> | null

const titles = z
	.record(
		z.string().min(1, 'Артикул не может быть пустым'),
		z.string().min(1, 'Название товара не может быть пустым'),
	)
	.refine(
		(titles) => Object.keys(titles).length > 0,
		'Должны быть указаны названия для всех товаров',
	)
export type T_Titles = z.infer<typeof titles> | null

const units = z.record(
	z.string().min(1, 'Ключ единицы измерения не может быть пустым'),
	z.string().min(1, 'Единица измерения не может быть пустой'),
)
export type T_Units = z.infer<typeof units> | null

const comboFile = z.object({
	name: z.string().min(1, 'Название файла не может быть пустым'),
	file: z
		.string()
		.url('Ссылка на файл должна быть валидным URL')
		.min(1, 'Ссылка на файл не может быть пустой'),
})

const combo = z
	.object({
		combo: z
			.record(
				z.string().min(1, 'Название шага в комбо не может быть пустым'),
				z
					.array(z.string().min(1, 'Артикул в комбо не может быть пустым'))
					.min(1, 'Список артикулов в комбо не может быть пустым'),
			)
			.refine(
				(combo) => Object.keys(combo).length > 0,
				'Комбо должен содержать хотя бы один шаг',
			),
		name: z
			.string()
			.min(1, 'Название комбо не может быть пустой строкой')
			.optional(),
		light_flow: z
			.number()
			.nonnegative('Световой поток не может быть отрицательным')
			.optional(),
		files: z
			.array(comboFile)
			.min(1, 'Список файлов не может быть пустым')
			.optional(),
		final_image: z
			.string()
			.url('Ссылка на изображение должна быть валидным URL')
			.optional(),
		final_drawing: z
			.string()
			.url('Ссылка на чертеж должна быть валидным URL')
			.optional(),
	})
	.passthrough()
const combos = z.array(combo)
export type T_Combo = z.infer<typeof combo>
export type T_Combos = z.infer<typeof combos> | null

const product = z
	.object({
		id: z.number().int().positive('ID товара должен быть положительным числом'),
		article: z.string().min(1, 'Артикул товара не может быть пустым'),
		title: z.string().min(1, 'Название товара не может быть пустым'),
		ip_class: z
			.number()
			.int()
			.nonnegative('Класс IP не может быть отрицательным')
			.nullable(),
		price: z.number().nonnegative('Цена не может быть отрицательной'),
		old_price: z.union([
			z.number().nonnegative('Старая цена не может быть отрицательной'),
			z.null(),
		]),
		sale: z.union([z.boolean(), z.null()]),
		image: z
			.string()
			.url('Ссылка на изображение должна быть валидным URL')
			.min(1, 'Ссылка на изображение не может быть пустой'),
		available: z.boolean(),
		height_in_assembly: z
			.number()
			.nonnegative('Высота в сборке не может быть отрицательной'),
		color_rendering_index: z.union([z.number(), z.string()]).nullable(),
		lamp_style: z.string().nullable().optional(),
		frame_type: z.string().optional(),
		armature_color: z
			.string()
			.min(1, 'Цвет арматуры не может быть пустым')
			.nullable(),
		power: z
			.number()
			.nonnegative('Мощность не может быть отрицательной')
			.nullable()
			.optional(),
		light_temperatures: z.string().nullable(),
		light_angle: z
			.number()
			.nonnegative('Угол освещения не может быть отрицательным')
			.nullable()
			.optional(),
		ugr: z.string(),
		link: z.string().min(1, 'Ссылка на товар не может быть пустой'),
		input_voltage_v: z.union([z.number(), z.string()]).nullable().optional(),
		power_range_w: z.union([z.number(), z.string()]).nullable().optional(),
		komplektaciya: z.string().nullable().optional(),
		tip_upravleniya: z.string().nullable().optional(),
		form: z.string().nullable().optional(),
		scattering_angle: z
			.number()
			.nonnegative('Угол рассеивания не может быть отрицательным')
			.optional(),
	})
	.passthrough() // ВСЕ дополнительные поля, которых нет в контракте, останутся в объекте

export type T_Product = z.infer<typeof product>

const products = z
	.record(z.string().min(1, 'Ключ продукта не может быть пустым'), product)
	.refine(
		(products) => Object.keys(products).length > 0,
		'Должен быть хотя бы один товар',
	)
export type T_Products = z.infer<typeof products> | null

const description = z.union([z.string(), z.null()]).optional()
export type T_Description = z.infer<typeof description>

const videos = z.array(z.record(z.string(), z.string())).optional()
export type T_Videos = z.infer<typeof videos>

const files = z.array(z.record(z.string(), z.string())).optional()
export type T_Files = z.infer<typeof files>
// #endregion

// #region Initial data
export const InitDataContract = z
	.object({
		id: z.number('Не указан ID конфигуратора'),
		is_admin: z.boolean().optional(),
		height_calc_type: z
			.string()
			.min(1, 'Тип расчета высоты не может быть пустым'),
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
		description,
		videos,
		files,
	})
	.refine((data) => {
		// Проверка согласованности steps и stepsCount
		const stepNames = Object.keys(data.steps || {})
		const stepCountNames = Object.keys(data.stepsCount || {})
		return (
			stepNames.length === stepCountNames.length &&
			stepNames.every((step) => stepCountNames.includes(step))
		)
	}, 'Шаги в steps и stepsCount должны быть согласованы')
export type T_InitData = z.infer<typeof InitDataContract>
// #endregion
