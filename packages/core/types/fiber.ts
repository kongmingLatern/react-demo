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
	dom: Document | null
	child?: Fiber
	sibling?: Fiber
	parent?: Fiber
}
