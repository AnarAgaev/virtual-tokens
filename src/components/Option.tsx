import {Box, Button, Icon, VStack} from '@chakra-ui/react'
import {X} from 'lucide-react'
import {useApp, useConfiguration} from '@/store'
import type {T_Id, T_Option} from '@/types'

interface I_Props {
	option: T_Option
	stepName: string
	selectorId: T_Id
	selectorCode: string | null
}

export const Option = ({
	option,
	stepName,
	selectorId,
	selectorCode,
}: I_Props) => {
	const setSelectedOption = useConfiguration((state) => state.setSelectedOption)
	const shouldOptionBlocking = useConfiguration(
		(state) => state.shouldOptionBlocking,
	)
	const {id, selected, value} = option
	const isLocked = shouldOptionBlocking({optionId: id})
	const userStatus = useApp((state) => state.userStatus)

	return (
		<Button
			minW={{base: '146px', lg: '138px'}}
			h={{base: '40px', lg: '48px'}}
			rounded="full"
			variant="outline"
			justifyContent="space-between"
			px="5"
			borderColor={isLocked ? 'gray.200' : 'gray.900'}
			color={isLocked ? 'gray.400' : selected ? 'white' : 'gray.900'}
			backgroundColor={isLocked ? 'gray.200' : selected ? 'gray.900' : 'white'}
			pointerEvents={selected ? 'none' : 'auto'}
			disabled={shouldOptionBlocking({
				optionId: id,
			})}
			onClick={() =>
				setSelectedOption({
					stepName,
					selectorId,
					optionId: id,
					isSelected: selected,
				})
			}
		>
			<VStack gap="0" w="full" align="flex-start">
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
	)
}
