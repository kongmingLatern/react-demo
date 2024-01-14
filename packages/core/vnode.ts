export function createTextNode(text) {
	return {
		type: 'TEXT_ELEMENT',
		props: {
			nodeValue: text,
			children: [],
		},
	}
}
export function createElement(type, props, ...children) {
	return {
		type,
		props: {
			...props,
			children: children.map(child =>
				typeof child === 'string'
					? createTextNode(child)
					: child
			),
		},
	}
}
export const React = {
	createElement,
}
