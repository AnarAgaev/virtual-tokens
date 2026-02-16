import {Box, Button, Icon, VStack} from '@chakra-ui/react'
import {X} from 'lucide-react'
import {Tooltip} from '@/components'
import {useApp, useConfiguration} from '@/store'
import type {T_Id, T_Option} from '@/types'

interface I_Props {
	option: T_Option
	stepName: string
	selectorId: T_Id
	selectorCode: string | null
	isDisabled: boolean
}

export const Option = ({
	option,
	stepName,
	selectorId,
	selectorCode,
	isDisabled,
}: I_Props) => {
	const shouldShowWarning = useConfiguration((state) => state.shouldShowWarning)
	const toggleWarningVisible = useConfiguration(
		(state) => state.toggleWarningVisible,
	)
	const setSelectedOption = useConfiguration((state) => state.setSelectedOption)
	const shouldOptionBlocking = useConfiguration(
		(state) => state.shouldOptionBlocking,
	)
	const {id, selected, value} = option
	const userStatus = useApp((state) => state.userStatus)
	const blockedData = shouldOptionBlocking({optionId: id})
	const isLocked = blockedData.shouldBlock

	const blockedMsg = blockedData.blockedBy
		? ` Заблокировано выбором: ${blockedData.blockedBy[0].selectorName} ${blockedData.blockedBy[0].optionValue}`
		: ''

	const filteredMsg = blockedData.filteredBy?.length
		? ` Отфильтровано выбором: ${blockedData.filteredBy[0].selectorName} ${blockedData.filteredBy[0].selectedValue}`
		: ''

	const tooltipMsg = `В этой конфигурации данный артикул не доступен.${blockedMsg}${filteredMsg}`

	const handlerOptionClick = () => {
		const optionData = {
			stepName,
			selectorId,
			optionId: id,
			isSelected: selected,
		}

		const showWarning = shouldShowWarning({selectorId})

		if (showWarning) {
			toggleWarningVisible({
				direction: 'show',
				optionData,
			})
			return
		}

		setSelectedOption(optionData)
	}

	return (
		<Tooltip
			showArrow
			content={tooltipMsg}
			positioning={{placement: 'top'}}
			disabled={!isLocked}
			openDelay={500}
		>
			<Button
				colorPalette="gray"
				variant="outline"
				rounded="full"
				size="xl"
				minW={{base: '146px', lg: '138px'}}
				h={{base: '40px', lg: '48px'}}
				justifyContent="space-between"
				px="5"
				borderColor={isLocked ? 'gray.200' : 'gray.900'}
				color={isLocked ? 'gray.400' : selected ? 'white' : 'gray.900'}
				backgroundColor={isLocked ? 'gray.200' : selected ? 'gray.900' : ''}
				pointerEvents={selected ? 'none' : 'auto'}
				disabled={isDisabled ? true : isLocked}
				onClick={handlerOptionClick}
			>
				<VStack gap="0.5" w="full" align="flex-start">
					<Box as="span" color="inherit" fontSize="sm" lineHeight="20px">
						{value}
					</Box>

					{/* Только для Админов, показываем артикулы на Опшинах */}
					{userStatus === 'admin' && (
						<Box as="span" fontSize="xs" lineHeight="8px" fontWeight="light">
							{option.products.map((product) => product.article).join(' • ')}
						</Box>
					)}
				</VStack>

				{/* Крестик - отжать опцию / снять выбор */}
				{selectorCode && selected && (
					<Icon
						pointerEvents="auto"
						as={X}
						boxSize="16px"
						_hover={{color: 'gray.200'}}
					/>
				)}
			</Button>
		</Tooltip>
	)
}
