import { defineConfig } from 'unocss'
import presetAttributify from '@unocss/preset-attributify'
import presetUno from '@unocss/preset-uno'

export default defineConfig({
	presets: [presetUno(), presetAttributify({})],
	shortcuts: {
		'flex-center': 'flex justify-center items-center',
		'absolute-center':
			'absolute left-50% top-50% translate-x-[-50%] translate-y-[-50%]',
	},
})
