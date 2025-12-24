import {Button, Flex, Heading, Input, Text, VStack} from '@chakra-ui/react'
import {ChevronDown, ChevronUp} from 'lucide-react'
import {formatNumber} from '@/helpers'
import {useApp, useComposition} from '@/store'

export const OrderForm = () => {
	const pushDotToCart = useComposition((state) => state.pushDotToCart)
	const updateComplectCount = useComposition(
		(store) => store.updateComplectCount,
	)
	const setActiveTab = useApp((state) => state.setActiveTab)
	const complectCount = useComposition((state) => state.complectCount)
	const isDotInCart = useComposition((state) => state.isDotInCart)
	const totalSum = useComposition((state) => state.totalPrice)
	const totalValue = totalSum * complectCount

	const onButtonInc = () => updateComplectCount({direction: 1})
	const onButtonDec = () => updateComplectCount({direction: -1})

	return (
		<VStack w="full" pb="1">
			<VStack gap="2" alignItems="flex-start" w="full">
				<Flex justify="space-between" align="center" w="full">
					<Heading
						fontWeight="semibold"
						fontSize="sm"
						lineHeight="20px"
						letterSpacing="0"
					>
						<Text display={{base: 'none', sm: 'inline'}} as="span">
							Введите количество
						</Text>
						<Text display={{sm: 'none'}} as="span">
							Количество
						</Text>
					</Heading>
					<Text
						as="span"
						fontWeight="semibold"
						fontSize="sm"
						color="gray.400"
						lineHeight="20px"
						letterSpacing="0"
					>
						Итого: {formatNumber(totalValue)} руб.
					</Text>
				</Flex>
				<Flex w="full" justify="space-between">
					<Input
						variant="outline"
						size="lg"
						name="count"
						borderRadius="0"
						borderColor="gray.200"
						borderRight="none"
						outline="none"
						readOnly
						value={complectCount}
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
							disabled={isDotInCart}
							onClick={onButtonInc}
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
							disabled={isDotInCart}
							onClick={onButtonDec}
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
					disabled={isDotInCart}
					onClick={pushDotToCart}
				>
					{isDotInCart ? 'В корзине' : 'Добавить в корзину'}
				</Button>
				<Button
					w={{base: 'full', sm: 'calc(50% - 4px)'}}
					colorPalette="gray"
					variant="solid"
					rounded="full"
					size="xl"
					onClick={() => setActiveTab({tabType: 'configuration'})}
				>
					Назад к расчетам
				</Button>
			</Flex>
		</VStack>
	)
}
