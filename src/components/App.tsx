import {
	Box,
	Button,
	Container,
	Flex,
	Grid,
	GridItem,
	Heading,
	Icon,
	Text,
	VStack,
} from '@chakra-ui/react'
import {CircleX, LockKeyhole, LockKeyholeOpen} from 'lucide-react'
import {Fragment, useEffect} from 'react'
import {useApp, useComposition, useConfiguration} from '@/store'

export const App = () => {
	const selectedProducts = useComposition((state) => state.selectedProducts)
	const requestInitData = useApp((state) => state.requestInitData)
	const modifications = useConfiguration((state) => state.modifications)
	const setSelectedOption = useConfiguration((state) => state.setSelectedOption)
	const hasSomeBlockedOptionBySelectorId = useConfiguration(
		(state) => state.hasSomeBlockedOptionBySelectorId,
	)
	const unblockAllSelector = useConfiguration(
		(state) => state.unblockAllSelector,
	)
	const shouldOptionBlocking = useConfiguration(
		(state) => state.shouldOptionBlocking,
	)

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
				columnGap="5"
				alignItems="flex-start"
			>
				{modifications &&
					Object.entries(modifications).map(([stepName, selectors]) => (
						<Fragment key={stepName}>
							<Heading
								size="sm"
								fontWeight="normal"
								color="orange.500"
								mb="-10"
								gridColumn="1/-1"
							>
								{stepName}
							</Heading>
							{selectors.map(
								({selectorId, selectorName, selectorOptions, selectorCode}) => (
									<Fragment key={selectorId}>
										<GridItem
											display="flex"
											alignItems="center"
											whiteSpace="nowrap"
											position="relative"
											fontWeight="thin"
											fontSize="lg"
											height="48px"
											pr="40px"
										>
											{selectorName}
											{hasSomeBlockedOptionBySelectorId({selectorId}) && (
												<Button
													rounded="full"
													size="xs"
													colorPalette="orange"
													aspectRatio="1"
													p="0"
													position="absolute"
													top="50%"
													right="0"
													transform="translateY(-50%)"
													title="Разблокировать"
													onClick={() => unblockAllSelector({selectorId})}
													className="group"
												>
													{/* Иконка закрытого замка */}
													<Icon
														as={LockKeyhole}
														position="absolute"
														_groupHover={{opacity: 0}} // скрывается при hover
													/>

													{/* Иконка открытого замка */}
													<Icon
														as={LockKeyholeOpen}
														position="absolute"
														opacity={0}
														_groupHover={{opacity: 1}} // показывается при hover
													/>
												</Button>
											)}
										</GridItem>
										<GridItem>
											<Flex gap={3} wrap="wrap">
												{}
												{selectorOptions.map((option) => (
													<Button
														key={option.id}
														minW="150px"
														rounded="full"
														size="xl"
														justifyContent="space-between"
														colorPalette={option.selected ? 'orange' : 'gray'}
														pointerEvents={option.selected ? 'none' : 'auto'}
														disabled={shouldOptionBlocking({
															optionId: option.id,
														})}
														onClick={() =>
															setSelectedOption({
																stepName,
																selectorId,
																optionId: option.id,
																isSelected: option.selected,
															})
														}
													>
														<VStack gap="0" w="full" align="flex-start">
															<Box as="span" fontWeight="medium">
																{option.value}
															</Box>
															<Box
																as="span"
																fontSize="16px"
																lineHeight="9px"
																fontWeight="light"
															>
																{option.products
																	.map((product) => product.article)
																	.join(' • ')}
															</Box>
														</VStack>
														{selectorCode && option.selected && (
															<Icon
																pointerEvents="auto"
																as={CircleX}
																boxSize="20px"
																_hover={{color: 'gray.950'}}
															/>
														)}
													</Button>
												))}
											</Flex>
										</GridItem>
									</Fragment>
								),
							)}
						</Fragment>
					))}
			</Grid>

			<Grid
				mt="20"
				columnGap="3"
				rowGap="2"
				templateColumns="repeat(auto-fill, minmax(150px, 1fr))"
			>
				{Object.entries(selectedProducts).map(
					([stepName, {selector, option, product}]) => {
						return (
							<GridItem key={stepName}>
								<Flex
									direction="column"
									px="3"
									py="2"
									rounded="10px"
									bgColor="gray.100"
									height="full"
								>
									<Heading size="xs" fontWeight="medium" color="orange.500">
										{stepName}
									</Heading>

									{option === 'Нет' || option === 'Да' ? (
										product ? (
											<Text fontSize="sm">{product.article}</Text>
										) : (
											<Text color="gray.400" fontSize="xs">
												Не выбрано
											</Text>
										)
									) : (
										<>
											<Text color="gray.400" fontSize="xs">
												{selector}: {option}
											</Text>
											<Text fontSize="sm">
												{product ? product.article : 'Не выбрано'}
											</Text>
										</>
									)}
								</Flex>
							</GridItem>
						)
					},
				)}
			</Grid>
		</Container>
	)
}
