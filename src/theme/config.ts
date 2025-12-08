import {createSystem, defaultConfig, defineConfig} from '@chakra-ui/react'

const config = defineConfig({
	globalCss: {
		html: {
			fontFamily: "'Open Sans', sans-serif",
		},
	},
	theme: {
		tokens: {
			colors: {},
			fonts: {
				body: {
					value: "'Open Sans', sans-serif",
				},
				heading: {
					value: "'Open Sans', sans-serif",
				},
			},
		},
	},
})

export const system = createSystem(defaultConfig, config)
