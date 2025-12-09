import {
	Box,
	Button,
	Flex,
	Grid,
	GridItem,
	Heading,
	Icon,
	Text,
	VStack,
} from '@chakra-ui/react'
import {LockKeyhole, LockKeyholeOpen, X} from 'lucide-react'
import {Fragment, useEffect} from 'react'
import {Option} from '@/components'
import {useApp, useComposition, useConfiguration} from '@/store'

export const Configurator = () => {
	const selectedProducts = useComposition((state) => state.selectedProducts)
	const virtualArticle = useComposition((state) => state.virtualArticle)
	const requestInitData = useApp((state) => state.requestInitData)
	const modifications = useConfiguration((state) => state.modifications)
	const setSelectedOption = useConfiguration((state) => state.setSelectedOption)
	const hasSomeBlockedOptionBySelectorId = useConfiguration(
		(state) => state.hasSomeBlockedOptionBySelectorId,
	)
	const unlockSelector = useConfiguration((state) => state.unlockSelector)
	const shouldOptionBlocking = useConfiguration(
		(state) => state.shouldOptionBlocking,
	)
	const hasProductWithBuiltInDriver = useConfiguration(
		(state) => state.hasProductWithBuiltInDriver,
	)

	useEffect(() => {
		requestInitData()
	}, [requestInitData])

	return (
		<>
			{/* Шаги */}
			<Flex direction="column" gap="8">
				{modifications &&
					Object.entries(modifications).map(([stepName, selectors]) => (
						<Flex key={stepName} direction="column" gap="1.5">
							{/* Имя шага */}
							{stepName === 'Драйвер' ? (
								!hasProductWithBuiltInDriver() ? (
									<Text fontSize="sm" lineHeight="20px" fontWeight="600">
										{stepName}
									</Text>
								) : null
							) : (
								<Text fontSize="sm" lineHeight="20px" fontWeight="600">
									{stepName}
								</Text>
							)}

							{/* Список Селекторов */}
							<Flex direction="column" gap="5">
								{selectors
									.map(
										({
											selectorId,
											selectorName,
											selectorOptions,
											selectorCode,
										}) => (
											<Flex
												key={selectorId}
												direction={{base: 'column', xl: 'row'}}
												gap="5"
											>
												{/* Имя селектора */}
												<Text
													display="flex"
													alignItems="center"
													fontSize="sm"
													lineHeight="20px"
													// pt={{base: 0, xl: '10px'}}
													w={{base: 'auto', xl: '23.5%'}}
													maxW="233px"
													h={{xl: '48px'}}
													flexShrink={0}
												>
													{selectorName}
												</Text>

												{/* Список Опшенов */}
												<Flex wrap="wrap" gap="2">
													{selectorOptions.map((option) => (
														<Option
															key={option.id}
															option={option}
															stepName={stepName}
															selectorId={selectorId}
															selectorCode={selectorCode}
														/>
													))}
												</Flex>
											</Flex>
										),
									)
									/**
									 * Отфильтровываем шаг Драйвер, если пользователь
									 * выбрал артикул со встроенным Драйвером.
									 * Остальные шаги всегда показываем.
									 */
									.filter(() =>
										stepName === 'Драйвер'
											? !hasProductWithBuiltInDriver()
											: true,
									)}
							</Flex>
						</Flex>
					))}
			</Flex>
		</>
	)
}
