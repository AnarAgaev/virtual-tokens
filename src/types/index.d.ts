export * from './app'
export * from './composition'
export * from './configuration'

declare global {
	interface Window {
		terms?: string[]
		initInformers?: () => void
		addDotToCart?: (order: Record<string, unknown>) => Promise<boolean>
	}
}
