import { EFFECTTAG } from '../effectTag'

export interface TextNode {
	type: 'TEXT_ELEMENT' | string
	props: {
		nodeValue?: any
		children: Array<any>
	}
}
export interface ElementType {
	type: string
	props: Record<'children' | any, any>
}

export interface Fiber {
	type?: string | any
	props?: Record<string, any>
	dom: Element | null
	child?: Fiber | null
	sibling?: Fiber | null
	parent?: Fiber | null
	alternate?: Fiber | null
	effectTag?: EFFECTTAG
	stateHooks?: any[]
	effectHook?: any
}
