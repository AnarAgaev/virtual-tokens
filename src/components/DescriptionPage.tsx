import {Button, Grid, GridItem, Heading, Text, VStack} from '@chakra-ui/react'
import {X} from 'lucide-react'
import {
	OrderForm,
	TotalFiles,
	TotalImage,
	TotalParams,
	TotalProducts,
} from '@/components'
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
				<TotalFiles />
			</VStack>
		</VStack>
	)
}
