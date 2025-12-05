// Функция для формирования строки на основе комбинации артикулов
export function generateCodeFromCombination(combination) {
	if (!combination || typeof combination !== 'object') {
		return null;
	}

	// Ищем артикул с "N" перед первым тире
	const nArticle = findArticleWithN(combination);

	if (nArticle) {
		return processNAArticle(nArticle);
	}

	// Ищем артикул с "50002"
	const article50002 = findArticleWith50002(combination);
	if (article50002) {
		return '000002';
	}

	// Ищем артикул с "220V"
	const article220V = findArticleWith220V(combination);
	if (article220V) {
		return '220V02';
	}

	// Если ничего не нашли
	return null;
}

// Поиск артикула с "N" перед первым тире
function findArticleWithN(combination) {
	for (const step in combination) {
		const article = combination[step];
		if (article && typeof article === 'string') {
			// Проверяем, есть ли "N" перед первым тире
			const firstDashIndex = article.indexOf('-');
			if (firstDashIndex > 0) {
				const partBeforeFirstDash = article.substring(0, firstDashIndex);
				if (partBeforeFirstDash.includes('N')) {
					return article;
				}
			}
		}
	}
	return null;
}

// Обработка артикула с "N"
function processNAArticle(article) {
	// Формат: 45002N-02
	const parts = article.split('-');

	if (parts.length !== 2) {
		return null;
	}

	const prefix = parts[0]; // "45002N"
	const suffix = parts[1]; // "02"

	// Ищем две цифры перед "N" в префиксе
	const nIndex = prefix.indexOf('N');
	if (nIndex > 0) {
		// Берем две цифры перед "N"
		const digitsBeforeN = prefix.substring(nIndex - 2, nIndex);

		// Добавляем "00" спереди
		const result = `00${digitsBeforeN}${suffix}`;

		return result;
	}

	return null;
}

// Поиск артикула с "50002"
function findArticleWith50002(combination) {
	for (const step in combination) {
		const article = combination[step];
		if (article && typeof article === 'string' && article.includes('50002')) {
			return article;
		}
	}
	return null;
}

// Поиск артикула с "220V"
function findArticleWith220V(combination) {
	for (const step in combination) {
		const article = combination[step];
		if (article && typeof article === 'string' && article.includes('220V')) {
			return article;
		}
	}
	return null;
}

// Пример с вашей комбинацией
console.log('=== ПРИМЕР С ВАШЕЙ КОМБИНАЦИЕЙ ===');
const combination = {
	"Декоративная рамка": "41005-BK",
	"Двойная рамка": "41007-BK",
	"Светодиодный модуль": "44001-220V-3K",
	"Драйвер": "не выбран",
	"Линза": "43002-18"
};

const result = generateCodeFromCombination(combination);
console.log(`\n🎯 Сформированный код: ${result}`);