import { Fiber } from './types/fiber'

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
			children: children
				.map(child => {
					if (child) {
						const isTextNode =
							typeof child === 'string' ||
							typeof child === 'number'
						return isTextNode
							? createTextNode(child)
							: child
					}
				})
				.filter(item => typeof item !== 'boolean' && item),
		},
	}
}

export function createFiber({
	type,
	props,
	dom,
	child,
	sibling,
	parent,
	effectTag,
	alternate,
}: Partial<Fiber>): Partial<Fiber> {
	return {
		type,
		props,
		dom,
		// 孩子节点
		child,
		// 兄弟节点
		sibling,
		// 父节点
		parent,
		// 标记
		effectTag,
		// 指向老节点
		alternate,
	}
}

export const React = {
	createElement,
}
