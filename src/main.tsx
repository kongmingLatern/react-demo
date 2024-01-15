import { React, ReactDom } from '../packages/core'

function App() {
	return (
		<div>
			<A />
			app
		</div>
	)
}

function A() {
	return <div>aaa</div>
}


ReactDom.createRoot(document.querySelector('#app')).render(
	<App />
)
