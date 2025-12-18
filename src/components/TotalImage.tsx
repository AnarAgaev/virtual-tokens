import {Box, Button, Flex, Image, Text, VStack} from '@chakra-ui/react'
import {DraftingCompass, PencilRuler, Image as Pic} from 'lucide-react'
import {useState} from 'react'
import {useComposition} from '@/store'

export const TotalImage = () => {
	const {final_image, final_drawing} = useComposition(
		(state) => state.resultAdditionalData,
	)

	const [showImage, setShowImage] = useState<boolean>(!!final_image)

	return (
		<VStack pt={{lg: '60px'}} gap={{base: '2', lg: '5'}}>
			<Flex px={{sm: '50px', md: '0'}} justify="center" w="full">
				<Box
					w="full"
					maxW={{md: '50%', lg: '80%', '2xl': '47.155%'}}
					aspectRatio="1"
					pos="relative"
					borderWidth="1px"
					borderStyle="solid"
					borderColor={
						!final_image && !final_drawing ? 'gray.200' : 'transparent'
					}
				>
					{final_image || final_drawing ? (
						<Image
							src={showImage ? final_image : final_drawing}
							pos="absolute"
							inset="50% auto auto 50%"
							transform="translate(-50%, -50%)"
							w="full"
							h="full"
						/>
					) : (
						<Flex
							direction="column"
							align="center"
							justify="center"
							w="full"
							h="full"
							gap="5"
							textAlign="center"
							textWrap="balance"
							fontSize="sm"
							p="10"
						>
							<DraftingCompass
								style={{width: '15%', height: '15%', stroke: '#eee'}}
							/>
							<Text>
								Покажем здесь картинку и схему, как только начнете выбирать на
								вкладке
								<Text as="span" fontWeight="bold">
									&nbsp;Конфигуратор
								</Text>
							</Text>
						</Flex>
					)}
				</Box>
			</Flex>
			{final_image && final_drawing && (
				<Flex
					justify="center"
					p="1"
					w="full"
					px={{sm: '50px', md: '0'}}
					maxW={{md: '50%', lg: '80%', '2xl': '47.155%'}}
				>
					<Button
						w="50%"
						colorPalette="gray"
						variant={showImage ? 'solid' : 'outline'}
						rounded="full"
						size="sm"
						onClick={() => setShowImage(true)}
					>
						<Pic /> Картинка
					</Button>
					<Button
						w="50%"
						colorPalette="gray"
						variant={showImage ? 'outline' : 'solid'}
						rounded="full"
						size="sm"
						onClick={() => setShowImage(false)}
					>
						<PencilRuler /> Чертеж
					</Button>
				</Flex>
			)}
		</VStack>
	)
}
