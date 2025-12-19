import {Link, List, Text} from '@chakra-ui/react'
import {Info} from 'lucide-react'
import {type JSX, useEffect, useId, useMemo} from 'react'
import {useComposition, useConfiguration} from '@/store'

const termsArr = window.terms
	? window.terms.map((term) => term.toLowerCase())
	: []

const getCharacteristicsList = (
	reactId: string,
	characteristics: Record<string, string>,
) => {
	const isInformer = document.getElementById('informer')
	const elementList: JSX.Element[] = []

	for (const key in characteristics) {
		const hasInformation =
			isInformer && termsArr.indexOf(key.toLowerCase()) !== -1

		elementList.push(
			<List.Item key={`${reactId}-${key}`} {...itemStyle}>
				{hasInformation ? (
					<Link
						display="flex"
						alignItems="center"
						gap="1"
						data-term={`${key}`}
						p="3"
						cursor="pointer"
						href={`#${key}`}
					>
						{key}{' '}
						<Info stroke="#09090B" style={{width: '16px', height: '16px'}} />
					</Link>
				) : (
					<Text p="3">{key}</Text>
				)}

				<Text p="3">{characteristics[key]}</Text>
			</List.Item>,
		)
	}

	// Заглушка до того, как начал выбирать конфигурацию
	if (!elementList.length) {
		elementList.push(
			<List.Item key={reactId} {...itemStyle} borderBottom="none">
				<Text textWrap="balance" w="full" maxW={{'2xl': '50%'}}>
					Покажем здесь характеристики комплекта, как только начнете выбирать на
					вкладке
					<Text as="span" fontWeight="bold">
						&nbsp;Конфигуратор
					</Text>
				</Text>
			</List.Item>,
		)
	}

	return elementList
}

export const TotalParams = () => {
	const reactId = useId()
	const units = useConfiguration((store) => store.units)
	const characteristics = useComposition((store) => store.resultCharacteristics)
	const resultAdditionalData = useComposition(
		(state) => state.resultAdditionalData,
	)

	if (resultAdditionalData.light_flow) {
		characteristics['Световой поток'] =
			`${resultAdditionalData.light_flow}${units?.light_flow ? units.light_flow : ''}`
	}

	const characteristicsList = useMemo(
		() => getCharacteristicsList(reactId, characteristics),
		[reactId, characteristics],
	)

	useEffect(() => {
		if (typeof window.initInformers === 'function') {
			window.initInformers()
		}
	}, [])

	return (
		<List.Root variant="plain" {...listStyle}>
			{characteristicsList}
		</List.Root>
	)
}

// #region Styles
const listStyle = {
	w: 'full',
	fontWeight: 'normal',
	fontSize: 'sm',
	lineHeight: '20px',
	letterSpacing: '0',
}

const itemStyle = {
	justifyContent: 'space-between',
	borderBottomWidth: '1px',
	borderBottomColor: 'gray.200',
}
// #endregion
