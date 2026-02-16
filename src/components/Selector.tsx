import {Button, Flex, Icon, Text} from '@chakra-ui/react'
import {Lock, LockOpen} from 'lucide-react'
import {Option, Tooltip} from '@/components'
import {useConfiguration} from '@/store'
import type {T_Selector} from '@/types'

export const Selector = (payload: {selector: T_Selector}) => {
	const {
		selectorId,
		selectorName,
		selectorOptions,
		selectorCode,
		stepName,
		selectorSelectedStatus,
	} = payload.selector

	const isDisabled = selectorSelectedStatus === 'blocked'

	const shouldShowWarning = useConfiguration((state) => state.shouldShowWarning)
	const toggleWarningVisible = useConfiguration(
		(state) => state.toggleWarningVisible,
	)
	const hasSomeBlockedOptionBySelectorId = useConfiguration(
		(state) => state.hasSomeBlockedOptionBySelectorId,
	)

	const unlockSelector = useConfiguration((state) => state.unlockSelector)

	const handleResetSelector = () => {
		const selectorData = {
			selectorId,
		}

		const showWarning = shouldShowWarning({selectorId})

		if (showWarning) {
			toggleWarningVisible({
				direction: 'show',
				selectorData,
			})
			return
		}

		unlockSelector({selectorId})
	}

	return (
		<Flex key={selectorId} direction={{base: 'column', xl: 'row'}} gap="5">
			{/* Имя селектора */}
			<Text
				display="flex"
				alignItems="center"
				fontSize="sm"
				lineHeight="20px"
				w={{base: 'auto', xl: '23.5%'}}
				maxW="233px"
				h={{xl: '48px'}}
				flexShrink={0}
				transition="color .1s linear"
				color={isDisabled ? 'gray.400' : 'inherit'}
			>
				{selectorName}
			</Text>

			<Flex wrap="wrap" gap="2">
				{/* Список Опшенов */}
				{selectorOptions.map((option) => (
					<Option
						key={option.id}
						option={option}
						stepName={stepName}
						selectorId={selectorId}
						selectorCode={selectorCode}
						isDisabled={isDisabled}
					/>
				))}

				{/* Кнопка разблокировать Селектор */}
				{hasSomeBlockedOptionBySelectorId({selectorId}) && (
					<Flex
						align="center"
						justify="center"
						w="8"
						h={{base: '40px', lg: '48px'}}
					>
						<Tooltip
							showArrow
							content={`Разблокировать ${selectorName}`}
							positioning={{placement: 'right'}}
							openDelay={500}
						>
							<Button
								rounded="full"
								size="xs"
								backgroundColor="gray.100"
								aspectRatio="1"
								p="0"
								className="group"
								onClick={handleResetSelector}
							>
								{/* Иконка закрытого замка */}
								<Icon
									as={Lock}
									pos="absolute"
									color="gray.600"
									_groupHover={{opacity: 0}} // скрывается при hover
								/>

								{/* Иконка открытого замка */}
								<Icon
									as={LockOpen}
									pos="absolute"
									color="gray.600"
									opacity={0}
									_groupHover={{opacity: 1}} // показывается при hover
								/>
							</Button>
						</Tooltip>
					</Flex>
				)}
			</Flex>
		</Flex>
	)
}
