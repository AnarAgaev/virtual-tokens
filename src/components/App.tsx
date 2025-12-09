import {Tabs, VStack} from '@chakra-ui/react'
import {useEffect} from 'react'
import {ConfiguratorPage, DescriptionPage} from '@/components'
import {useApp} from '@/store'
import '@/theme/app.css'

export const App = () => {
	const requestInitData = useApp((state) => state.requestInitData)

	useEffect(() => {
		requestInitData()
	}, [requestInitData])

	return (
		<VStack w="full">
			<Tabs.Root defaultValue="configurator" variant="outline" w="full">
				<Tabs.List>
					<Tabs.Trigger {...tabButtonStyle} value="configurator">
						Конфигуратор
					</Tabs.Trigger>
					<Tabs.Trigger {...tabButtonStyle} value="description">
						Описание
					</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="configurator">
					<ConfiguratorPage />
				</Tabs.Content>
				<Tabs.Content value="description">
					<DescriptionPage />
				</Tabs.Content>
			</Tabs.Root>
		</VStack>
	)
}

// #region Styles
const tabButtonStyle = {
	textStyle: {base: 'md', sm: 'xl'},
	fontWeight: {base: '400', sm: '300'},
	textTransform: 'uppercase',
	w: {base: '50%', sm: 'auto'},
}
// #endregion
