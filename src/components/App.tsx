import {
	Button,
	Container,
	Flex,
	Grid,
	GridItem,
	Heading,
	VStack,
} from '@chakra-ui/react'
import {Fragment, useEffect} from 'react'
import {useApp, useConfiguration} from '@/store'

export const App = () => {
	const requestInitData = useApp((state) => state.requestInitData)
	const modifications = useConfiguration((state) => state.modifications)

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
				color="gray.800"
			>
				Модификации
			</Heading>

			<VStack align="stretch" gap="10">
				{modifications &&
					Object.entries(modifications).map(([stepName, selectors]) => (
						<VStack key={stepName} align="stretch">
							<Heading size="xs" fontWeight="normal" color="gray.300">
								{stepName}
							</Heading>
							<Grid templateColumns="auto 1fr" gap="6" alignItems="center">
								{selectors.map((selector) => (
									<Fragment key={selector.selectorName}>
										<GridItem>{selector.selectorName}</GridItem>
										<GridItem>
											<Flex gap={4}>
												{selector.selectorOptionsProducts.map((option) => (
													<Button key={option.value} rounded="full">
														{option.value}
													</Button>
												))}
											</Flex>
										</GridItem>
									</Fragment>
								))}
							</Grid>
						</VStack>
					))}
			</VStack>
		</Container>
	)
}
