import {Flex, Grid, GridItem, Heading, Link} from '@chakra-ui/react'
import {Download} from 'lucide-react'
import {type JSX, useId, useMemo} from 'react'
import {useComposition, useConfiguration} from '@/store'
import type {T_ResultAdditionalData} from '@/types'

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
				w={{xl: 'calc(50% - 10px)'}}
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

export const TotalFiles = () => {
	const reactId = useId()
	const files = useConfiguration((store) => store.files)
	// const description = useConfiguration((store) => store.description)
	// const videos = useConfiguration((store) => store.videos)
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

	if (!resultFilesList.length) return null

	return (
		<Grid w="full" gap="5" gridTemplateColumns={{lg: 'repeat(3, 1fr)'}}>
			<GridItem>
				<Heading
					fontWeight="bold"
					fontSize="sm"
					lineHeight="20px"
					letterSpacing="0"
				>
					Файлы для скачивания
				</Heading>
			</GridItem>
			<GridItem gridColumnStart={{lg: 2}} gridColumnEnd={{lg: 4}}>
				<Flex
					direction={{base: 'column', xl: 'row'}}
					columnGap="5"
					rowGap="2"
					wrap="wrap"
					pos="relative"
				>
					{resultFilesList}
				</Flex>
			</GridItem>
		</Grid>
	)
}
