import {
	Box,
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
	const setSelectedOption = useConfiguration((state) => state.setSelectedOption)

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

			<Grid
				templateColumns="auto 1fr"
				rowGap="7"
				columnGap="8"
				alignItems="center"
			>
				{modifications &&
					Object.entries(modifications).map(([stepName, selectors]) => (
						<Fragment key={stepName}>
							<Heading
								size="sm"
								fontWeight="normal"
								color="orange"
								mb="-10"
								gridColumn="1/-1"
							>
								{stepName}
							</Heading>
							{selectors.map(({selectorId, selectorName, selectorOptions}) => (
								<Fragment key={selectorId}>
									<GridItem whiteSpace="nowrap">{selectorName}</GridItem>
									<GridItem>
										<Flex gap={3} wrap="wrap">
											{selectorOptions.map((option) => (
												<Button
													key={option.id}
													minW="150px"
													rounded="full"
													size="xl"
													colorPalette={option.selected ? 'orange' : 'gray'}
													pointerEvents={option.selected ? 'none' : 'auto'}
													disabled={Boolean(option.blockedBy)}
													onClick={() =>
														setSelectedOption({
															stepName,
															selectorId,
															optionId: option.id,
														})
													}
												>
													<VStack gap="0">
														<Box as="span" fontWeight="medium">
															{option.value}
														</Box>
														<Box
															as="span"
															fontSize="9px"
															lineHeight="9px"
															fontWeight="light"
														>
															{option.products
																.map((product) => product.article)
																.join(' • ')}
														</Box>
													</VStack>
												</Button>
											))}
										</Flex>
									</GridItem>
								</Fragment>
							))}
						</Fragment>
					))}
			</Grid>
		</Container>
	)
}
