import Unocss from 'unocss/vite'
import { defineConfig } from 'vitest/config'
export default defineConfig({
	plugins: [
		Unocss({
			configFile: './unocss.config.ts',
		}),
	],
	test: {
		globals: true,
	},
})
