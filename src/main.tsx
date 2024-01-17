import { React, ReactDom } from '../packages/core'

function App() {
	return (
		<div>
			<A num={1} />
			<A num={2} />
			app
		</div>
	)
}

function A({ num }) {
	return <div>aaa
		{num}
	</div>
}


ReactDom.createRoot(document.querySelector('#app')).render(
	<App />
)
