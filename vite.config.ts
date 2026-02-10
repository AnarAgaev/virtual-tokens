import path from 'node:path'
import react from '@vitejs/plugin-react'
import {defineConfig} from 'vite'

export default defineConfig({
	server: {
		host: true,
		port: 5173,

		// 🔥 ВАЖНО для Docker
		watch: {
			usePolling: true,
		},
	},

	plugins: [react()],

	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'), // теперь @ указывает на src
		},
	},
})
