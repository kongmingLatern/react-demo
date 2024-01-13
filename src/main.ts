import { ReactDom } from './core/React'
import { createElement } from './core/vnode'

const App = createElement('div', { id: 'root' }, 'app')

ReactDom.createRoot(document.querySelector('#app')).render(
	App
)
