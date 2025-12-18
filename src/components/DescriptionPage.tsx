import {
	Button,
	Flex,
	Grid,
	GridItem,
	Heading,
	Link,
	Text,
	VStack,
} from '@chakra-ui/react'
import {Download, X} from 'lucide-react'
import {OrderForm, PropList, TotalImage, TotalProducts} from '@/components'
import {useConfiguration} from '@/store'

export const DescriptionPage = () => {
	const createModifications = useConfiguration(
		(state) => state.createModifications,
	)
	return (
		<VStack gap="10" w="full">
			{/* Основные данные */}
			<Grid w="full" gap="5" gridTemplateColumns={{lg: 'repeat(3, 1fr)'}}>
				{/* Картинка */}
				<GridItem order={{lg: 2}}>
					<TotalImage />
				</GridItem>

				{/* Параметры */}
				<GridItem order={{lg: 1}}>
					<Heading
						fontWeight="bold"
						lineHeight="20px"
						fontSize="sm"
						flexShrink="0"
						mb={{base: '2', lg: '10'}}
					>
						Параметры
					</Heading>
					<VStack gap="5">
						<PropList />
					</VStack>
				</GridItem>

				{/* Состав комплекта */}
				<GridItem order={{lg: 3}}>
					<VStack p="0" h="full">
						<Heading
							fontWeight="bold"
							lineHeight="20px"
							fontSize="sm"
							mb={{base: '2', lg: '10'}}
							textAlign={{lg: 'right'}}
							w="full"
						>
							Состав комплекта
						</Heading>
						<VStack
							gap={{base: '5', md: '10'}}
							justifyContent="space-between"
							w="full"
							h="full"
						>
							<TotalProducts />
							<OrderForm />
						</VStack>
					</VStack>
				</GridItem>
			</Grid>

			{/* Сбросить конфигурацию */}
			<Button
				borderRadius="none"
				variant="solid"
				size="sm"
				color="white"
				textStyle="sm"
				w="full"
				onClick={createModifications}
			>
				<Text w="full">Сбросить конфигурацию</Text>
				<X />
			</Button>

			{/* Файлы для скачивания */}
			<VStack direction="column" w="full" gap="7">
				<Grid w="full" gap="5" gridTemplateColumns={{lg: 'repeat(3, 1fr)'}}>
					<GridItem>
						<Heading
							fontWeight="bold"
							fontSize="sm"
							lineHeight="20px"
							letterSpacing="0"
						>
							Файлы для скачивания
						</Heading>
					</GridItem>
					<GridItem gridColumnStart={{lg: 2}} gridColumnEnd={{lg: 4}}>
						<Flex
							direction={{base: 'column', xl: 'row'}}
							columnGap="5"
							rowGap="2"
							wrap="wrap"
							pos="relative"
						>
							{[1, 2, 3, 4, 5].map((i) => (
								<Link
									key={i}
									display="flex"
									alignItems="center"
									gap="3"
									href="https://example.com/"
									download
									w={{xl: 'calc(50% - 10px)'}}
								>
									<Flex
										align="center"
										justify="center"
										h="40px"
										w="40px"
										bgColor="#6E6E73"
										flexShrink={0}
									>
										<Download
											stroke="#FFFFFF"
											style={{width: 15, height: 15}}
										/>
									</Flex>
									Монтаж безрамочных светильников ЗЕРО ЛОК в натяжной
									потолок.pdf
								</Link>
							))}
						</Flex>
					</GridItem>
				</Grid>

				<Grid w="full" gap="5" gridTemplateColumns={{lg: 'repeat(3, 1fr)'}}>
					<GridItem>
						<Heading
							fontWeight="bold"
							fontSize="sm"
							lineHeight="20px"
							letterSpacing="0"
						>
							Видео
						</Heading>
					</GridItem>
					<GridItem gridColumnStart={{lg: 2}} gridColumnEnd={{lg: 4}}>
						<Flex
							direction={{base: 'column', xl: 'row'}}
							columnGap="5"
							rowGap="2"
							wrap="wrap"
							pos="relative"
						>
							{[1, 2, 3].map((i) => (
								<Link
									key={i}
									display="flex"
									alignItems="center"
									gap="3"
									href="https://example.com/"
									download
									w={{xl: 'calc(50% - 10px)'}}
								>
									<Flex
										align="center"
										justify="center"
										h="40px"
										w="40px"
										bgColor="#6E6E73"
										flexShrink={0}
									>
										<Download
											stroke="#FFFFFF"
											style={{width: 15, height: 15}}
										/>
									</Flex>
									Длинный текст с названием файла.pdf
								</Link>
							))}
						</Flex>
					</GridItem>
				</Grid>
			</VStack>
		</VStack>
	)
}
