import {
	Button,
	Container,
	Flex,
	Grid,
	GridItem,
	Heading,
} from '@chakra-ui/react'
import {Fragment, useEffect} from 'react'
import {useApp} from '../store'

const selects = [
	{
		title: 'Тип монтажа',
		buttons: ['Стандартный'],
	},
	{
		title: 'Тип механизма',
		buttons: ['Поворотный', 'Фиксированный'],
	},
	{
		title: 'Степень защиты',
		buttons: ['IP20', 'IP44'],
	},
]

export const App = () => {
	const requestInitData = useApp((state) => state.requestInitData)

	useEffect(() => {
		requestInitData()
	}, [requestInitData])

	return (
		<Container py="10">
			<Heading
				fontWeight="bold"
				size="4xl"
				letterSpacing="unset"
				mb="12"
				color="blue.500"
			>
				Модификации
			</Heading>
			<Grid templateColumns="auto 1fr" gap="6" alignItems="center">
				{selects.map((select) => (
					<Fragment key={select.title}>
						<GridItem>{select.title}</GridItem>
						<GridItem>
							<Flex gap={4}>
								{select.buttons.map((button) => (
									<Button key={button} rounded="full">
										{button}
									</Button>
								))}
							</Flex>
						</GridItem>
					</Fragment>
				))}
			</Grid>
		</Container>
	)
}
