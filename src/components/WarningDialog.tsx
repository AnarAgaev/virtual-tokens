import {Button, CloseButton, Dialog, Portal, Text} from '@chakra-ui/react'
import {useConfiguration} from '@/store'

const resetOverride: React.CSSProperties = {
	fontFamily: 'var(--chakra-fonts-body)',
	fontSize: 'var(--chakra-font-sizes-xs)',
	lineHeight: 'var(--chakra-line-heights-normal)',
	verticalAlign: 'unset',
	margin: 'unset',
	border: 'unset',
}

export const WarningDialog = () => {
	const setSelectedOption = useConfiguration((state) => state.setSelectedOption)
	const unlockSelector = useConfiguration((state) => state.unlockSelector)
	const warningData = useConfiguration((state) => state.warningData)
	const stopShowWarning = useConfiguration((state) => state.stopShowWarning)
	const toggleWarningVisible = useConfiguration(
		(state) => state.toggleWarningVisible,
	)

	return (
		<Dialog.Root
			role="alertdialog"
			open={warningData.visible}
			size="sm"
			placement="center"
			onOpenChange={(e) => {
				if (!e.open) {
					toggleWarningVisible({direction: 'hide'})
				}
			}}
			closeOnInteractOutside={true}
		>
			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner style={{width: '100dvw'}}>
					<Dialog.Content
						borderRadius="0"
						style={{outline: '0', borderRadius: '0'}}
					>
						<Dialog.CloseTrigger asChild>
							<CloseButton
								borderRadius="0"
								onClick={() => toggleWarningVisible({direction: 'hide'})}
							/>
						</Dialog.CloseTrigger>
						<Dialog.Header
							style={{
								paddingInline: 'var(--chakra-spacing-6)',
								paddingTop: 'var(--chakra-spacing-6)',
								paddingBottom: 'var(--chakra-spacing-4)',
							}}
						>
							<Dialog.Title
								fontWeight="medium"
								style={{fontWeight: 'var(--chakra-font-weights-medium)'}}
							>
								Подтвердите выбор
							</Dialog.Title>
						</Dialog.Header>
						<Dialog.Body
							style={{
								paddingInline: 'var(--chakra-spacing-6)',
								paddingTop: 'var(--chakra-spacing-2)',
								paddingBottom: 'var(--chakra-spacing-6)',
							}}
						>
							<Text fontWeight="normal" fontSize="14px">
								При внесении изменений выбранные ранее параметры ниже будут
								очищены!
							</Text>
						</Dialog.Body>
						<Dialog.Footer
							flexDirection={{base: 'column', sm: 'row'}}
							style={{
								paddingInline: 'var(--chakra-spacing-6)',
								paddingTop: 'var(--chakra-spacing-2)',
								paddingBottom: 'var(--chakra-spacing-4)',
							}}
						>
							<Button
								size="xs"
								variant="outline"
								borderRadius="none"
								w={{base: 'full', sm: 'auto'}}
								style={{...resetOverride}}
								onClick={() => {
									stopShowWarning()
									toggleWarningVisible({direction: 'hide'})
								}}
							>
								Больше не спрашивать
							</Button>
							<Button
								size="xs"
								variant="solid"
								borderRadius="none"
								color="white"
								w={{base: 'full', sm: 'auto'}}
								style={{...resetOverride}}
								onClick={() => toggleWarningVisible({direction: 'hide'})}
							>
								Не выбирать
							</Button>
							<Button
								size="xs"
								variant="solid"
								colorPalette="red"
								borderRadius="none"
								w={{base: 'full', sm: 'auto'}}
								style={{...resetOverride}}
								onClick={() => {
									if (warningData.optionData) {
										setSelectedOption(warningData.optionData)
									}

									if (warningData.selectorData) {
										unlockSelector(warningData.selectorData)
									}

									toggleWarningVisible({direction: 'hide'})
								}}
							>
								Выбрать
							</Button>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	)
}
