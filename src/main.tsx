import 'uno.css'

import { React, ReactDom, update, useState } from '../packages/core'

function App() {
	const [count, setCount] = useState(10)

	function handleClick() {
		setCount((c) => c + 1)
	}

	return (
		<div>
			{count}
			<button onClick={handleClick}>click</button>
			{/* <A num={10} /> */}
			{/* <B />
			<C />
			<D /> */}

		</div>
	)
}

let bcount = 1
function B() {
	console.log('render___B');
	const updateFn = update()
	function handleClick() {
		bcount++
		updateFn()
	}
	return <div><button onClick={handleClick}>click:{bcount}</button></div>
}

let count = 0
function C() {
	console.log('render___C');

	const updateFn = update()
	function handleClick() {
		count++
		updateFn()
	}
	return <div>
		<button onClick={handleClick}>click</button>:{count}
	</div>
}

let num = 0
function D() {
	const updateFn = update()
	function handleClick() {
		count++
		updateFn()
	}
	return <div className='bg-red-300'>
		<B />
		<C />
		<button onClick={handleClick}>Click</button>:{num}
	</div>
}

let showBar = true
function A() {
	const foo = <div>foo</div>
	const bar = <p>bar</p>
	const updateFn = update()

	function FunctionComponent() {
		return (
			<div>
				<h3>FunctionComponent</h3>
				<p>child1</p>
				<p>child2</p>
			</div>
		)
	}

	function handleClick() {
		showBar = !showBar
		updateFn()
	}
	return (
		<div>
			<div className='bg-blue-500 text-center'>
				{showBar}
			</div>

			<div className='bg-red-500 text-center color-white'>
				{
					showBar && <FunctionComponent />
				}
			</div>

			<button onClick={handleClick}>
				change
			</button>

			<div className='bg-green-500 text-center'>
				<h3>Change Status</h3>
				{showBar ? foo : bar}
			</div>
		</div>
	)
}

// let count = 0
// function A() {
// 	function handleClick() {
// 		console.log('handleClick', count);
// 		count++
// 		update()
// 	}
// 	return (
// 		<div>
// 			<button onClick={handleClick}>click</button>
// 			<div>count:{count}</div>
// 		</div>
// 	)
// }


ReactDom.createRoot(document.querySelector('#app')).render(
	<App />
)
