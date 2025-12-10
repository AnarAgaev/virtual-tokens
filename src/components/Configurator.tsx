import {Flex, Text} from '@chakra-ui/react'
import {useMemo} from 'react'
import {Selector} from '@/components'
import {useComposition, useConfiguration} from '@/store'

export const Configurator = () => {
	const selectedProducts = useComposition((state) => state.selectedProducts)
	const modifications = useConfiguration((state) => state.modifications)
	const hasProductWithBuiltInDriver = useConfiguration(
		(state) => state.hasProductWithBuiltInDriver,
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
			{filteredModifications.map(({stepName, selectors}) => (
				<Flex key={stepName} direction="column" gap="1.5">
					{/* Имя шага */}
					<Text fontSize="sm" lineHeight="20px" fontWeight="600">
						{stepName}
					</Text>

					{/* Список Селекторов на текущем Шаге */}
					<Flex direction="column" gap="5">
						{selectors.map((selector) => (
							<Selector key={selector.selectorId} selector={selector} />
						))}
					</Flex>
				</Flex>
			))}
		</Flex>
	)
}
