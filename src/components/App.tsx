import {Tabs} from '@chakra-ui/react'
import {useEffect} from 'react'
import {ConfigurationPage, DescriptionPage} from '@/components'
import {useApp} from '@/store'
import '@/theme/app.css'

export const App = () => {
	const requestInitData = useApp((state) => state.requestInitData)
	const activeTab = useApp((state) => state.activeTab)
	const setActiveTab = useApp((state) => state.setActiveTab)

	useEffect(() => {
		requestInitData()
	}, [requestInitData])

	return (
		<Tabs.Root
			variant="outline"
			w="full"
			value={activeTab}
			onValueChange={({value}) => {
				if (value === 'configuration' || value === 'description') {
					setActiveTab({tabType: value})
				}
			}}
		>
			<Tabs.List>
				<Tabs.Trigger {...tabButtonStyle} value="configuration" rounded="none">
					Конфигуратор
				</Tabs.Trigger>
				<Tabs.Trigger {...tabButtonStyle} value="description" rounded="none">
					Описание
				</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="configuration" pt={{base: '5', lg: '10'}}>
				<ConfigurationPage />
			</Tabs.Content>
			<Tabs.Content value="description" pt={{base: '5', lg: '10'}}>
				<DescriptionPage />
			</Tabs.Content>
		</Tabs.Root>
	)
}

// #region Styles
const tabButtonStyle = {
	textStyle: {base: 'sm', sm: 'xl'},
	fontWeight: {base: '400', sm: '300'},
	textTransform: 'uppercase',
	justifyContent: 'center',
	w: {base: '50%', md: 'auto'},
}
// #endregion
