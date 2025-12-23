import {
	Flex,
	Grid,
	GridItem,
	Image,
	Link,
	Tabs,
	Text,
	VStack,
} from '@chakra-ui/react'
import {Download, Play} from 'lucide-react'
import {type JSX, useId, useMemo, useState} from 'react'
import {useComposition, useConfiguration} from '@/store'
import type {T_ResultAdditionalData} from '@/types'
import type {T_Videos} from '@/zod'

const getResultFilesList = (
	reactId: string,
	fileList: T_ResultAdditionalData['files'],
) => {
	const elementsList: JSX.Element[] = []

	fileList.forEach((file) => {
		elementsList.push(
			<Link
				key={`${reactId}-${file.name}`}
				display="flex"
				alignItems="center"
				gap="3"
				href={file.file}
				download
				target="_blank"
			>
				<Flex
					align="center"
					justify="center"
					h="40px"
					w="40px"
					bgColor="#6E6E73"
					flexShrink={0}
				>
					<Download stroke="#FFFFFF" style={{width: 15, height: 15}} />
				</Flex>
				{file.name}
			</Link>,
		)
	})

	return elementsList
}

const getResultVideos = (reactId: string, videos: T_Videos) => {
	const elementsList: JSX.Element[] = []

	if (!videos?.length) {
		return elementsList
	}

	videos.forEach((video, i) => {
		elementsList.push(
			<GridItem
				key={`${reactId}-${video.name}`}
				gridColumn={{
					base: '1 / 2',
					md: (i + 1) % 2 === 0 ? '2 / 3' : '1 / 2',
					xl: (i + 1) % 2 === 0 ? '3 / 4' : '1 / 3',
				}}
				m="0"
				p="0"
				bgColor="gray.300"
				aspectRatio={16 / 9}
			>
				<Link
					display="block"
					href={video.video}
					data-fancybox="video-creative"
					w="full"
					h="full"
					pos="relative"
					bgColor="red.100"
					cursor="default"
					borderRadius="0"
				>
					<Image
						src={video.poster}
						alt={video.name}
						objectFit="cover"
						w="full"
						h="full"
						top="50%"
						left="50%"
						pos="absolute"
						transform="translate(-50%, -50%)"
					/>
					<Flex
						align="center"
						justify="center"
						as="button"
						w="15%"
						aspectRatio={1}
						rounded="full"
						bgColor="rgba(0, 0, 0, 0.01)"
						backdropFilter="blur(1px)"
						zIndex={1}
						top="50%"
						left="50%"
						pos="absolute"
						transform="translate(-50%, -50%)"
						cursor="pointer"
						transition="100ms linear"
						border="1px solid"
						borderColor="gray.300"
						_hover={{w: '16%', backdropFilter: 'blur(2px)'}}
					>
						<Play stroke="#d4d4d8" style={{width: '20%', height: '20%'}} />
					</Flex>
				</Link>
			</GridItem>,
		)
	})

	return elementsList
}

export const ConfigurationDetails = () => {
	const reactId = useId()
	const files = useConfiguration((store) => store.files)
	const description = useConfiguration((store) => store.description)
	const videos = useConfiguration((store) => store.videos)
	const resultAdditionalData = useComposition(
		(store) => store.resultAdditionalData,
	)

	const resultFilesList = useMemo(
		() =>
			getResultFilesList(reactId, [
				...(files || []),
				...(resultAdditionalData.files || []),
			]),
		[reactId, files, resultAdditionalData.files],
	)

	const resultVideosList = useMemo(
		() => getResultVideos(reactId, videos),
		[reactId, videos],
	)

	const [activeTab, setActiveTab] = useState<'description' | 'files' | 'video'>(
		description ? 'description' : videos?.length ? 'video' : 'files',
	)

	if (!resultFilesList?.length && !description && !videos?.length) return null

	return (
		<VStack direction="column" w="full" gap="7">
			<Tabs.Root
				variant="outline"
				w="full"
				value={activeTab}
				onValueChange={({value}) => {
					if (
						value === 'description' ||
						value === 'files' ||
						value === 'video'
					) {
						setActiveTab(value)
					}
				}}
			>
				<Tabs.List>
					{description && (
						<Tabs.Trigger
							{...tabButtonStyle}
							value="description"
							rounded="none"
						>
							Описание
						</Tabs.Trigger>
					)}

					{resultFilesList.length !== 0 && (
						<Tabs.Trigger {...tabButtonStyle} value="files" rounded="none">
							Файлы{' '}
							<Text as="span" display={{base: 'none', md: 'inline'}}>
								для скачивания
							</Text>
						</Tabs.Trigger>
					)}

					{videos?.length !== 0 && (
						<Tabs.Trigger {...tabButtonStyle} value="video" rounded="none">
							Видео
						</Tabs.Trigger>
					)}
				</Tabs.List>

				{/* Описание */}
				{description && (
					<Tabs.Content value="description" pt={{base: '5', lg: '10'}}>
						<Text w="full" maxW={{lg: '66%'}}>
							{description}
						</Text>
					</Tabs.Content>
				)}

				{/* Файлы для скачивания */}
				{resultFilesList.length !== 0 && (
					<Tabs.Content value="files" pt={{base: '5', lg: '10'}}>
						<Flex wrap="wrap" columnGap="5" rowGap="2">
							{resultFilesList}
						</Flex>
					</Tabs.Content>
				)}

				{/* Видео */}
				{videos?.length !== 0 && (
					<Tabs.Content value="video" pt={{base: '5', lg: '10'}}>
						<Grid
							alignItems="flex-start"
							gridTemplateColumns={{
								base: '1fr',
								md: 'repeat(2, 1fr)',
								xl: 'repeat(3, 1fr)',
							}}
							gap="5"
						>
							{resultVideosList}
						</Grid>
					</Tabs.Content>
				)}
			</Tabs.Root>
		</VStack>
	)
}

// #region Styles
const tabButtonStyle = {
	textStyle: {base: 'xs', sm: 'xl'},
	fontWeight: {base: '400', sm: '300'},
	textTransform: 'uppercase',
	justifyContent: 'center',
	w: {base: 'calc(100% / 3)', md: 'auto'},
}
// #endregion
