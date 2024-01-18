import { React, ReactDom, update } from '../packages/core'

function App() {
	return (
		<A num={10} />
	)
}

let count = 0
function A() {
	function handleClick() {
		console.log('handleClick', count);
		count++
		update()
	}
	return (
		<div>
			<button onClick={handleClick}>click</button>
			<div>count:{count}</div>
		</div>
	)
}


ReactDom.createRoot(document.querySelector('#app')).render(
	<App />
)
