export function render(el, container) {
	const dom =
		el.type === 'TEXT_ELEMENT'
			? document.createTextNode(el.nodeValue)
			: document.createElement(el.type)

	Object.keys(el.props).forEach(key => {
		if (key !== 'children') {
			dom[key] = el.props[key]
		}
	})

	const children = el.props.children
	children.forEach(child => {
		render(child, dom)
	})

	container.append(dom)
}
