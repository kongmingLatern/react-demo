let taskId = 1
export let nextWorkOfUnit = {}

export function render(el, container) {
	nextWorkOfUnit = {
		dom: container,
		props: {
			children: [el],
		},
	}
}

export function performWorkUnit(fiber) {
	// 1. 创建 dom
	if (!fiber.dom) {
		const dom = (fiber.dom = createDom(fiber))

		// 将 dom 添加至父元素中
		fiber.parent.dom.append(dom)

		// 2. 处理 props
		updateProps(dom, fiber.props)
	}

	// 3. 转换链表 设置好指针
	initChildren(fiber)

	// 4. 返回下一个要执行的任务

	if (fiber.child) {
		return fiber.child
	}

	if (fiber.sibling) {
		return fiber.sibling
	}

	return fiber.parent?.silbing
}

function initChildren(fiber: any) {
	let prevChild: Record<string, any> = {}
	const children = fiber.props.children
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
