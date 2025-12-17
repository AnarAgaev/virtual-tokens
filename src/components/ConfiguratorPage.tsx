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
						>
							<Box
								display={{base: 'none', md: 'block'}}
								w="25%"
								aspectRatio="1"
								background="transparent no-repeat center"
								backgroundSize="cover"
								backgroundImage={`url("data:image/svg+xml,%3Csvg width='500' height='500' viewBox='0 0 500 500' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M35.1523 54.8893C33.8828 55.0846 32.0273 56.4518 30.9531 57.819C29 60.358 29 61.2369 29 225.788V391.315L31.832 394.147L34.6641 396.979H177.633H320.602L322.848 401.569C333.785 424.323 358.785 441.51 383.98 443.659C418.648 446.686 448.824 429.401 463.18 398.346C467.184 389.753 470.406 375.885 470.406 367.096C470.406 353.424 465.914 337.409 458.492 325.006C454 317.389 440.914 304.401 433.59 300.299L427.535 296.881L427.438 178.522V60.1627L425.094 57.4283L422.75 54.694L229.977 54.5963C124.02 54.4987 36.3242 54.694 35.1523 54.8893ZM411.812 180.28V290.729L409.664 290.143C408.395 289.753 403.219 289.167 398.043 288.874L388.668 288.288L355.66 251.862C335.445 229.499 321.773 215.046 320.406 214.753C319.137 214.46 316.988 214.46 315.719 214.753C314.254 215.143 302.633 227.448 284.762 247.565C269.039 265.339 255.855 279.694 255.465 279.596C255.074 279.401 234.957 256.159 210.738 227.839C181.441 193.659 165.719 176.081 164.156 175.69C162.887 175.397 160.738 175.397 159.469 175.69C158.004 176.081 137.984 198.542 102.242 239.948C71.9688 275.006 46.6758 304.401 45.9922 305.182C44.8203 306.354 44.625 287.799 44.625 188.19V69.8307H228.219H411.812V180.28ZM206.734 246.881L251.168 298.835H255.562H259.957L288.57 266.608C304.293 248.835 317.574 234.381 318.062 234.381C319.625 234.381 369.918 290.534 369.332 291.51C369.039 292.096 368.16 292.487 367.379 292.487C364.938 292.487 348.727 301.276 343.258 305.671C335.152 312.018 327.34 321.979 322.457 332.038C316.207 345.026 314.742 351.96 314.742 367.878V381.354H179.684H44.625L44.8203 355.573L45.1133 329.792L103.219 262.311C135.152 225.299 161.52 194.928 161.812 194.928C162.105 194.928 182.32 218.366 206.734 246.881ZM407.418 305.768C419.137 308.796 427.242 313.581 436.227 322.663C445.699 332.233 449.703 339.264 453.023 352.253C456.734 367.194 454.098 384.87 445.797 398.639C438.18 411.53 422.945 422.858 407.906 426.862C399.508 429.01 385.055 429.01 376.656 426.862C343.941 418.073 323.531 384.186 331.539 352.253C334.859 339.264 338.863 332.233 348.336 322.663C357.223 313.678 365.621 308.6 376.656 305.768C383.98 303.815 400.191 303.815 407.418 305.768Z' fill='%23A1A1A1'/%3E%3Cpath d='M308.199 114.069C294.723 119.147 287.398 129.401 287.301 143.561C287.301 150.202 287.691 152.253 290.035 156.94C291.598 160.163 294.82 164.362 297.652 166.901C312.984 180.671 337.887 175.104 346.676 155.964C349.898 148.932 349.703 137.507 346.09 130.182C343.062 124.128 337.887 118.854 331.539 115.632C326.266 112.897 313.57 112.116 308.199 114.069ZM327.047 130.866C339.156 139.85 333.004 159.089 318.062 159.089C309.566 159.089 302.535 152.057 302.437 143.659C302.437 138.678 306.246 132.135 310.445 129.987C314.742 127.839 323.531 128.327 327.047 130.866Z' fill='%23A1A1A1'/%3E%3Cpath d='M387.301 322.663L384.469 325.495V354.987V384.479L387.301 387.311C388.863 388.874 391.109 390.143 392.281 390.143C393.453 390.143 395.699 388.874 397.262 387.311L400.094 384.479V354.987V325.495L397.262 322.663C395.699 321.1 393.453 319.831 392.281 319.831C391.109 319.831 388.863 321.1 387.301 322.663Z' fill='%23A1A1A1'/%3E%3Cpath d='M388.473 398.151C380.465 402.448 386.715 415.143 395.113 411.627C399.899 409.674 401.363 402.057 397.75 398.932C395.699 397.272 390.914 396.881 388.473 398.151Z' fill='%23A1A1A1'/%3E%3C/svg%3E%0A");`}
							></Box>
							<Text
								textAlign="center"
								textWrap="balance"
								color="gray.400"
								lineHeight="1.2"
								w={{base: '90%', md: '80%'}}
								fontSize={{base: 'clamp(8px, 2vw, 14px)', lg: '16px'}}
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
					<Text w="full">Сбросить конфигуратор</Text>
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
