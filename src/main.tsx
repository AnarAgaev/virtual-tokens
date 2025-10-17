// import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {App, ErrorBoundary} from '@/components'
import {Provider} from './components/ui/provider.tsx'

const rootElement = document.getElementById('root')

if (!rootElement) {
	throw new Error('Root element not found')
}

createRoot(rootElement).render(
	// <StrictMode>
	<ErrorBoundary>
		<Provider>
			<App />
		</Provider>
	</ErrorBoundary>,
	// </StrictMode>,
)
