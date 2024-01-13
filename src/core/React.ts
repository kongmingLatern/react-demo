import { render } from './render'

export const ReactDom = {
	createRoot(container) {
		return {
			render(el) {
				return render(el, container)
			},
		}
	},
}
