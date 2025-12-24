import {
	Button,
	Flex,
	Heading,
	Input,
	InputGroup,
	Text,
	VStack,
} from '@chakra-ui/react'
import {ChevronDown, ChevronUp, Pencil} from 'lucide-react'
import {useEffect, useRef, useState} from 'react'
import {formatNumber} from '@/helpers'
import {useCountHandlers} from '@/hooks'
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
	const defaultConfigurationName = useComposition(
		(state) => state.defaultConfigurationName,
	)
	const configurationName = useComposition((state) => state.configurationName)
	const setConfigurationName = useComposition(
		(state) => state.setConfigurationName,
	)
	const {onButtonInc, onButtonDec} = useCountHandlers()

	const inputName = useRef<HTMLInputElement | null>(null)
	const handleNameInputChange = () => {
		let name = inputName.current?.value

		if (!name) {
			name = defaultConfigurationName
		}

		setConfigurationName({name})
	}

	const [inputValue, setInputValue] = useState(complectCount.toString())

	useEffect(() => {
		setInputValue(complectCount.toString())
	}, [complectCount])

	const handleCountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value

		if (value === '') {
			setInputValue('')
			return
		}

		if (/^\d+$/.test(value)) {
			const numValue = parseInt(value, 10)

			if (numValue >= 1) {
				setInputValue(value)
				const diff = numValue - complectCount
				if (diff !== 0) {
					updateComplectCount({direction: diff})
				}
			}
		}
	}

	const handleCountInputBlur = () => {
		if (!inputValue || parseInt(inputValue, 10) < 1) {
			setInputValue('1')
			if (complectCount !== 1) {
				const diff = 1 - complectCount
				updateComplectCount({direction: diff})
			}
		}
	}

	return (
		<VStack w="full" pb="1" gap="5">
			{/* Количество */}
			<VStack gap="2" alignItems="flex-start" w="full">
				<Flex justify="space-between" align="center" w="full">
					<Heading {...inputHeadingStyle}>
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
						value={inputValue}
						onChange={handleCountInputChange}
						onBlur={handleCountInputBlur}
						disabled={isDotInCart}
						type="text"
						inputMode="numeric"
						pattern="[0-9]*"
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

			{/* Переименовать конфигурацию */}
			<VStack gap="2" alignItems="flex-start" w="full">
				<Heading {...inputHeadingStyle}>Придумайте название проекта</Heading>
				<InputGroup
					w="full"
					padding="0"
					startElement={
						<Pencil stroke="#5B5B5F" style={{width: 44, height: 16}} />
					}
				>
					<Input
						ref={inputName}
						variant="outline"
						size="lg"
						name="name"
						borderRadius="0"
						borderColor="gray.200"
						outline="none"
						value={
							configurationName === defaultConfigurationName
								? ''
								: configurationName
						}
						onChange={handleNameInputChange}
						placeholder="Ваше название для конфигурации"
						overflow="hidden"
						textOverflow="ellipsis"
						whiteSpace="nowrap"
						boxSizing="border-box"
						pl="44px"
						disabled={isDotInCart}
					/>
				</InputGroup>
			</VStack>

			{/* Кнопки */}
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

// #region Styles
const inputHeadingStyle = {
	fontWeight: 'semibold',
	fontSize: 'sm',
	lineHeight: '20px',
	letterSpacing: '0',
}
// #endregion
