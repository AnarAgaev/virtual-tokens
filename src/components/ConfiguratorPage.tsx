import {Box, Button, Flex, Image, Text} from '@chakra-ui/react'
import {X} from 'lucide-react'
import {Configurator} from '@/components'

export const ConfiguratorPage = () => {
	return (
		<Flex
			direction={{base: 'column', lg: 'row'}}
			gap={{base: 5, lg: 10, xl: '126px'}}
		>
			<Flex
				gap={{base: '5', lg: '4'}}
				order={{lg: 1}}
				direction={{lg: 'column'}}
				align={{lg: 'center'}}
				w={{lg: '23.879%'}}
				flexShrink={0}
			>
				<Box
					w={{base: '26.6%', lg: 'full'}}
					aspectRatio={1}
					pos="relative"
					flexShrink="0"
				>
					<Image
						fit="cover"
						src="https://shrunk.website.yandexcloud.net/images/1b/e7/1be7842d17131610374f9b4e1794afa0/570x570/0.webp"
					/>
				</Box>
				<Flex gap="1" align="center" w="full" direction="column">
					<Text textStyle="sm" textAlign="center">
						Виртуальный артикул:
					</Text>
					<Text textStyle="xl" fontWeight="light" textAlign="center">
						44001-220V-3K
					</Text>
				</Flex>
			</Flex>

			<Flex direction="column" w="full" gap="10">
				<Configurator />
				<Button
					borderRadius="none"
					variant="solid"
					size="sm"
					color="white"
					textStyle="sm"
					maxW="991px"
				>
					<Text w="full">Сбросить настройки</Text>
					<X />
				</Button>
			</Flex>
		</Flex>
	)
}

// #region Styles
// #endregion
