let taskId = 1
let root: any = null
export let nextWorkOfUnit = {}

export function render(el, container) {
	nextWorkOfUnit = {
		dom: container,
		props: {
			children: [el],
		},
	}
	// 记录首次的根节点
	root = nextWorkOfUnit
}

export function performWorkUnit(fiber) {
	const isFunctionComponent =
		typeof fiber.type === 'function'

	// 如果不是函数组件
	if (!isFunctionComponent) {
		// 1. 创建 dom
		if (!fiber.dom) {
			const dom = (fiber.dom = createDom(fiber))

			// 将 dom 添加至父元素中
			// 这行逻辑问题在于：如果后续没有时间分配给节点的话，浏览器会卡顿（等待其他任务完成之后）再进行渲染
			// fiber.parent.dom.append(dom)

			// 2. 处理 props
			updateProps(dom, fiber.props)
		}
	}

	// 将函数组件和普通标签的数据做格式化处理
	const children = isFunctionComponent
		? [fiber.type()]
		: fiber.props.children
	// 3. 转换链表 设置好指针
	initChildren(fiber, children)

	// 4. 返回下一个要执行的任务

	if (fiber.child) {
		return fiber.child
	}

	if (fiber.sibling) {
		return fiber.sibling
	}

	return fiber.parent?.silbing
}

/**
 * 从根节点进行渲染
 * @param root 根节点
 */
export function commitRoot(root) {
	commitWork(root.child)
	root = null
}

export function commitWork(fiber) {
	if (!fiber) return
	let fiberParent = fiber.parent
	while (!fiberParent.dom) {
		fiberParent = fiberParent.parent
	}
	if (fiber.dom) {
		fiberParent.dom.append(fiber.dom)
	}
	commitWork(fiber.child)
	commitWork(fiber.sibling)
}

function initChildren(fiber: any, children) {
	let prevChild: Record<string, any> = {}
	children.forEach((child, index) => {
		const newChild = {
			type: child.type,
			props: child.props,
			dom: null,
			// 孩子节点
			child: null,
			// 兄弟节点
			sibling: null,
			// 父节点
			parent: fiber,
		}
		if (index === 0) {
			fiber.child = newChild
		} else {
			prevChild.sibling = newChild
		}
		prevChild = newChild
	})
}

function updateProps(dom: any, props: any) {
	Object.keys(props).forEach(key => {
		if (key !== 'children') {
			dom[key] = props[key]
		}
	})
}

function createDom(fiber: any): any {
	return fiber.type === 'TEXT_ELEMENT'
		? document.createTextNode(fiber.nodeValue)
		: document.createElement(fiber.type)
}

export function workLoop(deadline: IdleDeadline) {
	let shouldYield = false

	while (!shouldYield && nextWorkOfUnit) {
		// 返回下一个任务
		nextWorkOfUnit = performWorkUnit(nextWorkOfUnit)
		console.log(`taskId: ${taskId} is running`)
		shouldYield = deadline.timeRemaining() < 1
	}

	if (!nextWorkOfUnit) {
		// 如果没有下一个任务，那么再添加所有dom节点
		commitRoot(root)
	}

	requestIdleCallback(workLoop)
}

/**
 * docs: https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestIdleCallback
 *
 * NOTE: 在浏览器空闲时期被调用
 *
 * use:
 *  requestIdleCallback(callback)
 *  requestIdleCallback(callback, options)
 *
 * 1. 使开发者能够在主事件循环上执行后台和低优先级工作，而不会影响延迟关键事件
 * 2. 一般会按先进先调用的顺序执行
 * 3. 如果回调函数指定了执行超时时间timeout，则有可能为了在超时前执行函数而打乱执行顺序。
 */
requestIdleCallback(workLoop)
