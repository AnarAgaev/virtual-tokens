import {Flex, Text} from '@chakra-ui/react'
import {useMemo} from 'react'
import {Selector} from '@/components'
import {useConfiguration} from '@/store'

export const Configurator = () => {
	const modifications = useConfiguration((state) => state.modifications)
	const hasProductWithBuiltInDriver = useConfiguration(
		(state) => state.hasProductWithBuiltInDriver,
	)
	const hasStepUnblockedSelector = useConfiguration(
		(state) => state.hasStepUnblockedSelector,
	)

	// #region Фильтруем шаг Драйвер
	const filteredModifications = useMemo(() => {
		if (!modifications) return []

		const hasBuiltInDriver = hasProductWithBuiltInDriver()

		return Object.entries(modifications)
			.filter(([stepName]) => stepName !== 'Драйвер' || !hasBuiltInDriver)
			.map(([stepName, selectors]) => ({
				stepName,
				selectors: selectors.filter(
					(selector) => selector.stepName !== 'Драйвер' || !hasBuiltInDriver,
				),
			}))
	}, [modifications, hasProductWithBuiltInDriver])
	// #endregion

	return (
		<Flex direction="column" gap="8">
			{filteredModifications.map(({stepName, selectors}) => {
				const isStepDisabled = !hasStepUnblockedSelector({selectors})

				return (
					<Flex key={stepName} direction="column" gap="1.5">
						{/* Имя шага */}
						<Text
							fontSize="sm"
							lineHeight="20px"
							fontWeight="600"
							transition="color .1s linear"
							color={isStepDisabled ? 'gray.400' : 'inherit'}
						>
							{stepName}
						</Text>

						{/* Список Селекторов на текущем Шаге */}
						<Flex direction="column" gap="5">
							{selectors.map((selector) => (
								<Selector key={selector.selectorId} selector={selector} />
							))}
						</Flex>
					</Flex>
				)
			})}
		</Flex>
	)
}
