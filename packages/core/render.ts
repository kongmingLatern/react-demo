import { Fiber } from './types/fiber'
import { createFiber } from '.'
// let taskId = 1
let root: Fiber | null = null
let currentRoot: Fiber | null = null

export let nextWorkOfUnit: Fiber = {} as Fiber

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

function updateFunctionComponent(fiber: Fiber) {
	const children = [fiber.type(fiber.props)]
	initChildren(fiber, children)
}

function updateHostComponent(fiber: Fiber) {
	if (!fiber.dom) {
		const dom = (fiber.dom = createDom(fiber))
		// 将 dom 添加至父元素中
		// NOTE:这行逻辑问题在于：如果后续没有时间分配给节点的话，浏览器会卡顿（等待其他任务完成之后）再进行渲染
		// fiber.parent.dom.append(dom)
		// 2. 处理 props
		updateProps(dom, fiber.props, {})
	}
	const children = fiber.props!.children
	// 3. 转换链表 设置好指针
	initChildren(fiber, children)
}

export function performWorkUnit(fiber: Fiber) {
	const isFunctionComponent =
		typeof fiber.type === 'function'

	if (!isFunctionComponent) {
		updateHostComponent(fiber)
	} else {
		updateFunctionComponent(fiber)
	}

	// 4. 返回下一个要执行的任务

	if (fiber.child) {
		return fiber.child
	}

	let nextFiber = fiber
	while (nextFiber) {
		if (nextFiber.sibling) return nextFiber.sibling
		nextFiber = nextFiber.parent!
	}
}

/**
 * 从根节点进行渲染
 * @param root 根节点
 */
export function commitRoot() {
	commitWork(root!.child!)
	// 重新构造一棵树,用于更新props
	currentRoot = root
	console.log('currentRoot', currentRoot)
	root = null
}

export function update() {
	// 更新成新的树
	nextWorkOfUnit = {
		dom: currentRoot!.dom,
		props: currentRoot?.props,
		alternate: currentRoot,
	}
	root = nextWorkOfUnit
}

export function commitWork(fiber: Fiber) {
	if (!fiber) return
	let fiberParent: Fiber = fiber.parent as Fiber
	while (!fiberParent.dom) {
		fiberParent = fiberParent.parent!
	}

	if (fiber.effectTag === 'update') {
		updateProps(
			fiber.dom!,
			fiber.props,
			fiber.alternate?.props
		)
	} else if (fiber.effectTag === 'placement') {
		if (fiber.dom) {
			fiberParent.dom.append(fiber.dom)
		}
	}

	commitWork(fiber.child!)
	commitWork(fiber.sibling!)
}

function initChildren(fiber: Fiber, children) {
	let oldFiber = fiber.alternate?.child
	let prevChild: Fiber = {} as Fiber
	children.forEach((child, index) => {
		const isSameType =
			oldFiber && oldFiber.type === child.type
		let newFiber: Fiber = {} as Fiber
		console.log('isSameType', isSameType, oldFiber, child)

		if (isSameType) {
			// NOTE: update
			newFiber = createFiber({
				type: child.type,
				props: child.props,
				dom: oldFiber?.dom,
				child: null,
				sibling: null,
				parent: fiber,
				effectTag: 'update',
				alternate: oldFiber,
			}) as Fiber
		} else {
			newFiber = createFiber({
				type: child.type,
				props: child.props,
				dom: null,
				child: null,
				sibling: null,
				parent: fiber,
				effectTag: 'placement',
			}) as Fiber
		}

		if (oldFiber) {
			// 指针指向 兄弟节点
			oldFiber = oldFiber.sibling
		}

		if (index === 0) {
			fiber.child = newFiber
		} else {
			prevChild.sibling = newFiber
		}
		prevChild = newFiber
	})
}

function updateProps(
	dom: Element,
	nextProps: any,
	prevProps: any
) {
	// 1. old have, new haven't  => 删除
	Object.keys(prevProps).forEach(key => {
		if (key !== 'children') {
			if (!(key in nextProps)) {
				dom.removeAttribute(key)
			}
		}
	})

	// 2. old haven't, new have  => 添加
	// 3. old have, new have     => 修改

	Object.keys(nextProps).forEach(key => {
		if (key !== 'children') {
			if (nextProps[key] !== prevProps[key]) {
				let eventName
				if ((eventName = /^on(.*)/g.exec(key))) {
					eventName = eventName[1].toLocaleLowerCase()
					dom.addEventListener(eventName, nextProps[key])
				} else {
					dom[key] = nextProps[key]
				}
			}
		}
	})

	// Object.keys(props).forEach(key => {
	// 	if (key !== 'children') {
	// 		let eventName
	// 		if ((eventName = /^on(.*)/g.exec(key))) {
	// 			eventName = eventName[1].toLocaleLowerCase()
	// 			dom.addEventListener(eventName, props[key])
	// 		} else {
	// 			dom[key] = props[key]
	// 		}
	// 	}
	// })
}

function createDom(fiber: any) {
	return fiber.type === 'TEXT_ELEMENT'
		? document.createTextNode(fiber.nodeValue)
		: document.createElement(fiber.type)
}

export function workLoop(deadline: IdleDeadline) {
	let shouldYield = false

	while (!shouldYield && nextWorkOfUnit) {
		// 返回下一个任务
		nextWorkOfUnit = performWorkUnit(nextWorkOfUnit)!
		// console.log(`taskId: ${taskId} is running`)
		shouldYield = deadline.timeRemaining() < 1
	}

	if (!nextWorkOfUnit && root) {
		// 如果没有下一个任务，那么再添加所有dom节点
		commitRoot()
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
