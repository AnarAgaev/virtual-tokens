import {
	Box,
	Button,
	Flex,
	Grid,
	GridItem,
	Heading,
	Image,
	Text,
} from '@chakra-ui/react'
import {X} from 'lucide-react'
import {Configurator, ImagePlaceholder} from '@/components'
import {useApp, useComposition, useConfiguration} from '@/store'

export const ConfigurationPage = () => {
	const userStatus = useApp((state) => state.userStatus)
	const selectedProducts = useComposition((state) => state.selectedProducts)
	const virtualArticle = useComposition((state) => state.virtualArticle)
	const getResultData = useComposition((state) => state.getResultData)
	const resultData = getResultData()
	const createModifications = useConfiguration(
		(state) => state.createModifications,
	)

	return (
		<Flex
			direction={{base: 'column', lg: 'row'}}
			gap={{base: 5, lg: 10, xl: '126px'}}
		>
			<Flex
				gap={{base: '5', lg: '4'}}
				order={{lg: 1}}
				direction={{lg: 'column'}}
				align={{lg: 'center'}}
				w={{lg: '23.879%'}}
				flexShrink={0}
			>
				<Box
					w={{base: '26.6%', lg: 'full'}}
					aspectRatio={1}
					pos="relative"
					flexShrink="0"
					backgroundColor="gray.100"
				>
					{resultData?.image ? (
						<Image
							w="full"
							h="full"
							fit="cover"
							loading="lazy"
							src={resultData.image}
						/>
					) : (
						<Flex
							align="center"
							justify="center"
							pos="absolute"
							w="full"
							h="full"
							direction="column"
							gap="5"
						>
							<Box
								display={{base: 'none', md: 'block'}}
								w="25%"
								aspectRatio="1"
							>
								<ImagePlaceholder color="#d4d4d8" />
							</Box>
							<Text
								textAlign="center"
								textWrap="balance"
								color="gray.400"
								lineHeight="1.3"
								w={{base: '90%', md: '70%'}}
								fontSize={{base: 'clamp(8px, 2vw, 14px)', lg: 'sm'}}
							>
								Покажем здесь картинку, как только сможем её получить.
							</Text>
						</Flex>
					)}
				</Box>
				<Flex gap="1" align="center" w="full" direction="column">
					<Text textStyle="sm" textAlign="center">
						Виртуальный артикул:
					</Text>
					<Text
						textStyle={{base: 'xs', sm: 'xl'}}
						fontWeight="light"
						textAlign="center"
						lineHeight="1.2"
						whiteSpace="pre-line"
						textWrap={!virtualArticle ? 'balance' : 'nowrap'}
					>
						{!virtualArticle &&
							`Недостаточно выбора${'\n'}для формирования Артикула`}
						{virtualArticle
							?.map((article) => (article ? `${article}` : `XXX`))
							.map(
								(article, idx) =>
									`${article}${idx !== virtualArticle.length - 1 ? '-' : ''}`,
							)}
					</Text>
				</Flex>
			</Flex>

			<Flex direction="column" w="full" gap="10">
				<Configurator />
				<Button
					borderRadius="none"
					variant="solid"
					size="sm"
					color="white"
					textStyle="sm"
					maxW="991px"
					onClick={createModifications}
				>
					<Text w="full">Сбросить конфигурацию</Text>
					<X />
				</Button>

				{/* Только для Админов, показываем Выбранные значения */}
				{userStatus === 'admin' && (
					<Grid gap="2" templateColumns="repeat(auto-fill, minmax(150px, 1fr))">
						{Object.entries(selectedProducts).map(
							([stepName, selectedData]) => {
								return (
									<GridItem key={stepName}>
										<Flex
											direction="column"
											p="3"
											bgColor="gray.100"
											height="full"
										>
											<Heading mb="1">
												<Text
													fontSize="xs"
													lineHeight="1rem"
													fontWeight="bold"
													color="gray.700"
												>
													{stepName}
												</Text>
											</Heading>

											{/* Для выбора из нескольких селекторов где нет целевого продукта */}
											{Array.isArray(selectedData) && (
												<>
													<Text color="gray.400" fontSize="xs">
														Не выбрано:
													</Text>
													<Text
														fontSize="sm"
														color="gray.800"
														fontWeight="light"
														lineHeight="1.2"
														mt="1"
													>
														{selectedData.map(
															(selectorName, idx) =>
																`${selectorName}${idx !== selectedData.length - 1 ? ', ' : ''}`,
														)}
													</Text>
												</>
											)}

											{/* Когда нашли или нет целевые продукты */}
											{!Array.isArray(selectedData) &&
												(selectedData.products.length ? (
													selectedData.products.map((product) => (
														<Text
															key={product.id}
															fontSize="sm"
															color="gray.800"
															fontWeight="light"
														>
															{product.article}
														</Text>
													))
												) : (
													<Text color="gray.400" fontSize="xs">
														Не выбрано
													</Text>
												))}
										</Flex>
									</GridItem>
								)
							},
						)}
					</Grid>
				)}
			</Flex>
		</Flex>
	)
}
