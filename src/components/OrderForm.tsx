import {Button, Flex, Heading, Input, VStack} from '@chakra-ui/react'
import {ChevronDown, ChevronUp} from 'lucide-react'

export const OrderForm = () => {
	return (
		<VStack w="full" pb="1">
			<VStack gap="2" alignItems="flex-start" w="full">
				<Heading
					fontWeight="semibold"
					fontSize="sm"
					lineHeight="20px"
					letterSpacing="0"
				>
					Введите количество
				</Heading>
				<Flex w="full" justify="space-between">
					<Input
						variant="outline"
						size="lg"
						name="count"
						borderRadius="0"
						borderColor="gray.200"
						borderRight="none"
						outline="none"
						value={12}
					/>
					<Flex direction="column">
						<Button
							colorPalette="gray"
							variant="outline"
							borderRadius="0"
							p="0"
							h="50%"
							w="auto"
							minW="initial"
							aspectRatio="1 / 1"
							borderBottom="none"
						>
							<ChevronUp stroke="#E6E6E7" style={{width: 14, height: 14}} />
						</Button>
						<Button
							colorPalette="gray"
							variant="outline"
							borderRadius="0"
							p="0"
							h="50%"
							w="auto"
							minW="initial"
							aspectRatio="1 / 1"
						>
							<ChevronDown stroke="#E6E6E7" style={{width: 14, height: 14}} />
						</Button>
					</Flex>
				</Flex>
			</VStack>
			<Flex direction={{base: 'column', sm: 'row'}} gap="2" w="full">
				<Button
					w={{base: 'full', sm: 'calc(50% - 4px)'}}
					colorPalette="gray"
					variant="outline"
					rounded="full"
					size="xl"
				>
					Добавить в корзину
				</Button>
				<Button
					w={{base: 'full', sm: 'calc(50% - 4px)'}}
					colorPalette="gray"
					variant="solid"
					rounded="full"
					size="xl"
				>
					Назад к расчетам
				</Button>
			</Flex>
		</VStack>
	)
}
