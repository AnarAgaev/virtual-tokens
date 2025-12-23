import {Button, Grid, GridItem, Heading, Text, VStack} from '@chakra-ui/react'
import {X} from 'lucide-react'
import {useEffect, useState} from 'react'
import {
	ConfigurationDetails,
	OrderForm,
	TotalImage,
	TotalParams,
	TotalProducts,
} from '@/components'
import {useComposition, useConfiguration} from '@/store'

export const DescriptionPage = () => {
	const createModifications = useConfiguration(
		(state) => state.createModifications,
	)
	const selectedProducts = useComposition((state) => state.selectedProducts)
	const resetCompleteCount = useComposition((state) => state.resetCompleteCount)

	const [isSelectedProducts, setIsSelectedProducts] = useState<boolean>(false)

	useEffect(() => {
		const products = Object.entries(selectedProducts).flatMap(
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			([_stepName, stepData]) => {
				if (Array.isArray(stepData)) {
					return [] // пропускаем массивы строк
				}
				return stepData.products
			},
		)

		if (!products.length) {
			resetCompleteCount()
		}

		setIsSelectedProducts(!!products.length)
	}, [selectedProducts, resetCompleteCount])

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
						<TotalParams />
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
							{isSelectedProducts ? <OrderForm /> : null}
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

			{/* Описание / Файлы для скачивания / Видео */}
			<ConfigurationDetails />
		</VStack>
	)
}
