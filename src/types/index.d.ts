export * from './app'
export * from './composition'
export * from './configuration'

declare global {
	interface Window {
		virtualTokenApiLink: string
		terms?: string[]
		initInformers?: () => void
		addDotToCart?: (order: Record<string, unknown>) => Promise<boolean>
	}
}
