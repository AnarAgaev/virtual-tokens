type ZodFormattedError = {
	_errors: string[]
} & {
	[key: string]: ZodFormattedError | undefined
}

let idx = 1

export const formatZodErrors = (
	errors: ZodFormattedError,
	parentKey = '',
): string[] => {
	return Object.entries(errors).flatMap(([key, value]) => {
		if (key === '_errors' && Array.isArray(value) && value.length > 0) {
			// Общие ошибки на этом уровне
			return value.map(
				(msg) =>
					`🔥 \x1b[31m #${idx++} Zod Error \x1b[33m [${parentKey || 'root'}]: ${msg}`,
			)
		}

		// Рекурсивно вызываем только если value является объектом и не массивом
		if (value && typeof value === 'object' && !Array.isArray(value)) {
			const newParentKey = parentKey ? `${parentKey}.${key}` : key
			return formatZodErrors(value, newParentKey)
		}

		return []
	})
}
