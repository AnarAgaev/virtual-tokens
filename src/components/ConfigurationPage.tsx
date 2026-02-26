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
import {Configurator, ImagePlaceholder, StepImageSlider} from '@/components'
import {useApp, useComposition, useConfiguration} from '@/store'

export const ConfigurationPage = () => {
	const setActiveTab = useApp((state) => state.setActiveTab)
	const userStatus = useApp((state) => state.userStatus)
	const selectedProducts = useComposition((state) => state.selectedProducts)
	const virtualArticle = useComposition((state) => state.virtualArticle)
	const getResultData = useComposition((state) => state.getResultData)
	const resultData = getResultData()
	const createModifications = useConfiguration(
		(state) => state.createModifications,
	)

	const isVirtualArticleValid = !virtualArticle
		? false
		: !virtualArticle.every((a) => a === null)

	const isVirtualArticleComplete = !virtualArticle
		? false
		: !virtualArticle?.some((a) => a === null)

	return (
		<Flex
			direction={{base: 'column', lg: 'row'}}
			gap={{base: 5, lg: 10, xl: '126px'}}
			alignItems={{lg: 'stretch'}}
		>
			{/* Сайдбар с картинками */}
			<Flex
				gap={{base: '5', lg: '4'}}
				order={{lg: 1}}
				direction="column"
				align={{lg: 'center'}}
				justify={{lg: 'space-between'}}
				w={{lg: '23.879%'}}
				flexShrink={0}
			>
				{/* Картинка шага */}
				<Box
					display={{base: 'none', lg: 'block'}}
					w="full"
					aspectRatio={1}
					pos="relative"
					flexShrink="0"
				>
					<StepImageSlider />
				</Box>

				<Flex
					gap={{base: '5', lg: '4'}}
					direction={{lg: 'column'}}
					align={{lg: 'center'}}
					flexShrink={0}
					w="full"
				>
					{/* Виртуальный артикул */}
					<Flex
						gap="2"
						align="center"
						w="full"
						direction="column"
						order={{base: '2', lg: '1'}}
					>
						<Text textStyle="sm" textAlign="center">
							Виртуальный артикул:
						</Text>
						<Text
							textStyle={{base: 'xs', xl: 'md'}}
							fontWeight="light"
							textAlign="center"
							lineHeight="1.2 !important"
							whiteSpace="pre-line"
							textWrap={!isVirtualArticleValid ? 'balance' : 'nowrap'}
						>
							{isVirtualArticleValid
								? virtualArticle
										?.map((article) => (article ? `${article}` : `XXX`))
										.join('-')
								: `Недостаточно выбора${'\n'}для формирования Артикула`}
						</Text>
					</Flex>

					{/* Итоговая картинка */}
					<Box
						w={{base: '26.6%', lg: 'full'}}
						aspectRatio={1}
						pos="relative"
						flexShrink="0"
						backgroundColor="gray.100"
						order={{base: '1', lg: '2'}}
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
									Покажем здесь картинку итоговой конфигурации
								</Text>
							</Flex>
						)}
					</Box>

					{/* Кнопка перейти к Итого */}
					{isVirtualArticleComplete && (
						<Button
							display={{base: 'none', lg: 'flex'}}
							borderRadius="none"
							variant="solid"
							size="sm"
							color="white"
							textStyle="sm"
							mt="6"
							order="3"
							w="full"
							onClick={() => setActiveTab({tabType: 'description'})}
						>
							Посмотреть всю конфигурацию
						</Button>
					)}
				</Flex>
			</Flex>

			{/* Конфигуратор */}
			<Flex direction="column" w="full" gap="10" justify="space-between">
				<Configurator />

				{isVirtualArticleComplete && (
					<Button
						display={{lg: 'none'}}
						borderRadius="none"
						variant="solid"
						size="sm"
						color="white"
						textStyle="sm"
						w="full"
						onClick={() => setActiveTab({tabType: 'description'})}
					>
						Посмотреть всю конфигурацию
					</Button>
				)}
				<Button
					mt={{base: '-6', lg: 'initial'}}
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
