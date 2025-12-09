import {createSystem, defaultConfig, defineConfig} from '@chakra-ui/react'

const config = defineConfig({
	globalCss: {
		html: {
			fontFamily: "'Nunito Sans', sans-serif",
		},
	},
	theme: {
		tokens: {
			colors: {},
			fonts: {
				body: {
					value: "'Nunito Sans', sans-serif",
				},
				heading: {
					value: "'Nunito Sans', sans-serif",
				},
			},
		},
	},
})

export const system = createSystem(defaultConfig, config)
