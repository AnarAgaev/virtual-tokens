/* eslint-disable @typescript-eslint/no-explicit-any */
import {z} from 'zod'

export const logExtraFields = (
	obj: unknown,
	schema: z.ZodTypeAny,
	path = '',
): void => {
	if (!obj || typeof obj !== 'object') return

	const objRecord = obj as Record<string, unknown>

	if (schema instanceof z.ZodObject) {
		const schemaKeys = Object.keys(schema.shape)
		const objKeys = Object.keys(objRecord)

		const extraKeys = objKeys.filter((key) => !schemaKeys.includes(key))
		for (const key of extraKeys) {
			console.warn(
				`Дополнительное свойство: ${path ? `${path}.` : ''}${key}`,
				objRecord[key],
			)
		}

		for (const key of schemaKeys) {
			const schemaField = schema.shape[key]
			const value = objRecord[key]

			if (value && typeof value === 'object') {
				logExtraFields(value, schemaField, path ? `${path}.${key}` : key)
			}

			// Массив объектов
			if (Array.isArray(value) && schemaField instanceof z.ZodArray) {
				// biome-ignore lint/suspicious/noExplicitAny: Просто проверка, ошибка в типизации ни на что не повлияет
				const inner = schemaField._def.type as any
				if (inner instanceof z.ZodObject) {
					value.forEach((item, idx) => {
						logExtraFields(
							item,
							inner,
							`${path ? `${path}.` : ''}${key}[${idx}]`,
						)
					})
				}
			}

			// Record объектов
			if (
				value &&
				typeof value === 'object' &&
				schemaField instanceof z.ZodRecord
			) {
				// biome-ignore lint/suspicious/noExplicitAny: Просто проверка, ошибка в типизации ни на что не повлияет
				const inner = schemaField._def.valueType as any
				Object.entries(value).forEach(([k, v]) => {
					if (inner instanceof z.ZodObject) {
						logExtraFields(v, inner, `${path ? `${path}.` : ''}${key}.${k}`)
					}
				})
			}
		}
	}
}
