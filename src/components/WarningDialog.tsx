import {Button, CloseButton, Dialog, Portal, Text} from '@chakra-ui/react'
import {useConfiguration} from '@/store'

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
				<Dialog.Positioner>
					<Dialog.Content borderRadius="0">
						<Dialog.CloseTrigger asChild>
							<CloseButton
								borderRadius="0"
								onClick={() => toggleWarningVisible({direction: 'hide'})}
							/>
						</Dialog.CloseTrigger>
						<Dialog.Header>
							<Dialog.Title fontWeight="medium">Подтвердите выбор</Dialog.Title>
						</Dialog.Header>
						<Dialog.Body>
							<Text fontWeight="normal" fontSize="14px">
								При внесении изменений выбранные ранее параметры ниже будут
								очищены!
							</Text>
						</Dialog.Body>
						<Dialog.Footer flexDirection={{base: 'column', sm: 'row'}}>
							<Button
								size="xs"
								variant="outline"
								borderRadius="none"
								w={{base: 'full', sm: 'auto'}}
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
