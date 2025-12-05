// Функция для формирования строки символов из артикула светодиодного модуля
export function formatLedModuleCode(combination) {
	let parts = null;
	let has220V = null;
	for (const step in combination) {

		const article = combination[step];
		if (!article) continue;

		if (article.startsWith('44')) {


			parts = article.split('-');
			has220V = article.includes('220V');
		}
	}
	let powerDigits = '';
	let temperaturePart = '';

	// Определяем логику в зависимости от количества дефисов и наличия 220V
	if (parts.length === 3 && has220V) {
		// Формат: 44002-220V-3K
		powerDigits = parts[0].slice(-2);        // из "44002" берем "02"
		temperaturePart = parts[2];              // "3K", "27K", "DTW" и т.д.
	} else if (parts.length === 2) {
		// Формат: 44002-3K
		powerDigits = parts[0].slice(-2);        // из "44002" берем "02"
		temperaturePart = parts[1];              // "3K", "27K", "DTW" и т.д.
	} else {
		return '000000'; // Неизвестный формат
	}

	// Обрабатываем окончание цветовой температуры
	let temperatureCode = '';

	if (temperaturePart.length === 2) {
		temperatureCode = `0${temperaturePart}`;
	} else if (temperaturePart.length === 3) {
		temperatureCode = temperaturePart;
	} else if (temperaturePart.length === 1) {
		temperatureCode = `00${temperaturePart}`;
	} else {
		temperatureCode = temperaturePart.slice(0, 3).padStart(3, '0');
	}


	temperatureCode = temperatureCode.toUpperCase();

	return powerDigits + temperatureCode;
}

const combination = {
	"Декоративная рамка": "41005-BK",
	"Двойная рамка": "41007-BK",
	"Светодиодный модуль": "44002-DTW",
	"Драйвер": "не выбран",
	"Линза": "43002-50"
};
const result = formatLedModuleCode(combination);
console.log(result);