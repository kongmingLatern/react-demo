import { React, ReactDom } from '../packages/core'

function App() {
	return (
		<div>
			<A num={10} />
			<A num={20} />
		</div>
	)
}

function A({ num }) {
	function handleClick() {
		console.log('handleClick');
	}
	return (
		<div>
			<button onClick={handleClick}>{num}</button>
			<div>123</div>
		</div>
	)
}


ReactDom.createRoot(document.querySelector('#app')).render(
	<App />
)
