import {ChakraProvider} from '@chakra-ui/react'
import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {App, ErrorBoundary} from '@/components'
import {system} from '@/theme/config'

const rootElement = document.getElementById('virtualToken')

if (!rootElement) {
	throw new Error('Root element not found')
}

createRoot(rootElement).render(
	<StrictMode>
		<ErrorBoundary>
			<ChakraProvider value={system}>
				<App />
			</ChakraProvider>
		</ErrorBoundary>
	</StrictMode>,
)
