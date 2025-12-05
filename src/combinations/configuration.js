async function getAllPossibleCombinationsFromAPI(
	apiUrl,
	existComplect,
	existAlFrame,
) {
	try {
		console.log('🌐 Загрузка данных с API...')

		const response = await fetch(apiUrl)

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		const dotsData = await response.json()
		console.log('✅ Данные успешно загружены')

		return getAllPossibleCombinations(dotsData, existComplect, existAlFrame)
	} catch (error) {
		console.error('❌ Ошибка загрузки данных:', error)
		return []
	}
}

// Основная функция для анализа комбинаций
function getAllPossibleCombinations(dotsData, existComplect, existAlFrame) {
	if (!dotsData || !dotsData.steps || !dotsData.blacklists) {
		console.error('❌ Ошибка: недостаточно данных')
		return []
	}

	const steps = dotsData.steps
	const blacklists = dotsData.blacklists
	const outList = ['41022-BK', '41022-WH', '41022-GD']

	// Исключаем Светофильтр и Защитную накладку из шагов
	const stepNames = Object.keys(steps).filter(
		(step) =>
			step !== 'Светофильтр' &&
			step !== 'Защитная накладка IP' &&
			(existComplect || step !== 'Монтажный комплект') &&
			(existAlFrame || step !== 'Фиксирующее кольцо'),
	)
	//console.log(steps)
	console.log('📋 Шаги для анализа:', stepNames.join(', '))

	const combinations = []

	// Рекурсивная функция для генерации комбинаций
	function generateCombinations(currentStepIndex, currentCombination) {
		if (currentStepIndex >= stepNames.length) {
			// Проверяем комбинацию на валидность
			if (isValidCombination(currentCombination, blacklists, outList)) {
				combinations.push({ ...currentCombination })
			}
			return
		}

		const currentStep = stepNames[currentStepIndex]
		const stepGroups = steps[currentStep]

		// Особенная обработка для светодиодного модуля
		if (currentStep === 'Светодиодный модуль') {
			// Для светодиодного модуля выбираем всю группу (модуль + драйвер)
			for (const moduleGroup of stepGroups) {
				// moduleGroup - это массив типа ["44002-3K", "45002N-02"]
				const newCombination = {
					...currentCombination,
					[currentStep]: moduleGroup[0], // светодиодный модуль
					Драйвер: moduleGroup[1] || null, // драйвер (если есть)
				}

				generateCombinations(currentStepIndex + 1, newCombination)
			}
		} else if (
			currentStep === 'Декоративная рамка' &&
			(!stepNames.includes('Монтажный комплект') ||
				!stepNames.includes('Фиксирующее кольцо'))
		) {
			// Для дек.рамки выбираем всю группу (дек. рамка + мон.комплект + фикс.кольцо)
			for (const moduleGroup of stepGroups) {
				// moduleGroup - это массив типа ["44002-3K", "45002N-02"]
				const newCombination = {
					...currentCombination,
					[currentStep]: moduleGroup[0], // Декоративная рамка
					...(moduleGroup.length > 1 &&
						existComplect && { 'Монтажный комплект': moduleGroup[1] || null }),
					...(moduleGroup.length > 2 &&
						existAlFrame && { 'Фиксирующее кольцо': moduleGroup[2] || null }),
				}

				generateCombinations(currentStepIndex + 1, newCombination)
			}
		} else {
			// Обычные шаги - перебираем все варианты (включая null)

			const stepArticles = stepGroups
				.flat()
				.filter((article) => article !== null)

			for (const article of stepArticles) {
				const newCombination = {
					...currentCombination,
					[currentStep]: article,
				}

				generateCombinations(currentStepIndex + 1, newCombination)
			}
		}
	}

	generateCombinations(0, {})

	return combinations
}

// Проверка комбинации на валидность
function isValidCombination(combination, blacklists, outList) {
	const articles = Object.values(combination).filter(
		(article) => article !== null && !Array.isArray(article),
	)

	// Проверка по блэклистам
	if (!isValidByBlacklists(articles, blacklists)) {
		return false
	}

	if (!isValidByOut(combination, outList)) {
		return false
	}

	return true
}

// Проверка по блэклистам
function isValidByBlacklists(articles, blacklists) {
	for (const article of articles) {
		const articleBlacklist = getBlacklistForArticle(article, blacklists)

		for (const otherArticle of articles) {
			if (otherArticle !== article && articleBlacklist.includes(otherArticle)) {
				return false
			}
		}
	}
	return true
}

// Получение блэклиста для артикула
function getBlacklistForArticle(article, blacklists) {
	const blockedArticles = new Set()

	blacklists.forEach((blockedList) => {
		if (blockedList.includes(article)) {
			blockedList.forEach((art) => { blockedArticles.add(art) })
		}
	})

	return Array.from(blockedArticles)
}

// Проверка по АУТ
function isValidByOut(combination, outList) {
	if (isOutMatch(combination, outList)) {
		return true
	}

	return false
}

// Проверка соответствия комбинации комбо
function isOutMatch(combination, outList) {
	for (const step in combination) {
		const selectedArticle = combination[step]

		if (outList.includes(selectedArticle)) {
			return false
		}
	}
	return true
}

// Функция для вывода комбинаций
function printCombinations(combinations) {
	console.log(`\n📊 Найдено ${combinations.length} комбинаций:\n`)

	// Ограничиваем вывод первыми 10 комбинациями
	const displayCombinations = combinations /*.slice(0, 10)*/
	displayCombinations.forEach((combination, index) => {
		//  console.log(`🔄 Комбинация ${index + 1}:`);

		// Выводим все шаги включая драйвер
		const allSteps = {
			...combination,
			...(combination['Драйвер'] && { Драйвер: combination['Драйвер'] }),
		}

		let comma
		Object.keys(allSteps).forEach((step, index, array) => {
			const article = allSteps[step]
			comma = index < array.length - 1 ? ',' : ''
			if (article) {
				console.log(`   "${step}": "${article}"${comma}`)

				//console.log(`   ${step}: ${article} `);
			} else {
				console.log(`   "${step}": "не выбран"${comma}`)
				//console.log(`   ${step}: не выбран`);
			}
		})
	})

	console.log(`Всего ${combinations.length} комбинаций`)

	return combinations
}

// Основная функция анализа
export async function analyzeCombinations(
	apiUrlOrData,
	existComplect,
	existAlFrame,
) {
	console.log('🔍 Анализ возможных комбинаций...\n')

	let combinations
	let dotsData

	if (typeof apiUrlOrData === 'string') {
		combinations = await getAllPossibleCombinationsFromAPI(
			apiUrlOrData,
			existComplect,
			existAlFrame,
		)
		dotsData = await fetch(apiUrlOrData).then((res) => res.json())
	} else {
		dotsData = apiUrlOrData
		combinations = getAllPossibleCombinations(
			dotsData,
			existComplect,
			existAlFrame,
		)
	}

	if (!combinations || combinations.length === 0) {
		console.log('❌ Не удалось получить комбинации')
		return []
	}

	// Выводим базовую информацию
	//  printCombinations(combinations);

	return combinations
}

/*analyzeCombinations('https://technolight.ru/api/dots/19')
	.then(combinations => {
		console.log('✅ Анализ завершен');
	});*/
