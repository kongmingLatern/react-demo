import { ReactDom, createElement } from '../packages/core'

const App = createElement('div', { id: 'root' }, 'app')

ReactDom.createRoot(document.querySelector('#app')).render(
	App
)
