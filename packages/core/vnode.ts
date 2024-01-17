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
			children: children.map(child => {
				const isTextNode =
					typeof child === 'string' ||
					typeof child === 'number'
				return isTextNode ? createTextNode(child) : child
			}),
		},
	}
}

export function createFiber(
	type,
	props,
	dom,
	child,
	sibling,
	fiber
) {
	return {
		type,
		props,
		dom,
		// 孩子节点
		child,
		// 兄弟节点
		sibling,
		// 父节点
		parent: fiber,
	}
}

export const React = {
	createElement,
}
