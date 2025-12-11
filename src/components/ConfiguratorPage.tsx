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
import {Configurator} from '@/components'
import {useApp, useComposition, useConfiguration} from '@/store'

export const ConfiguratorPage = () => {
	const userStatus = useApp((state) => state.userStatus)
	const selectedProducts = useComposition((state) => state.selectedProducts)
	const virtualArticle = useComposition((state) => state.virtualArticle)
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
				>
					<Image
						fit="cover"
						loading="lazy"
						src="https://shrunk.website.yandexcloud.net/images/1b/e7/1be7842d17131610374f9b4e1794afa0/570x570/0.webp"
					/>
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
					<Text w="full">Сбросить настройки</Text>
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
											<Heading
												size="xs"
												fontWeight="bold"
												color="gray.700"
												mb="1"
											>
												{stepName}
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
