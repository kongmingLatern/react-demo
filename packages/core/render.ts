import { EFFECTTAG } from './effectTag'
import { Fiber } from './types/fiber'
import { createFiber } from '.'
// let taskId = 1
let wipRoot: Fiber | null = null
let currentRoot: Fiber | null = null
let deletions: any[] = []
let wipFiber: Fiber | null = null

export let nextWorkOfUnit: Fiber | undefined = {} as Fiber

export function render(el, container) {
	wipRoot = {
		dom: container,
		props: {
			children: [el],
		},
	}
	// 记录首次的根节点
	nextWorkOfUnit = wipRoot
}

function updateFunctionComponent(fiber: Fiber) {
	wipFiber = fiber
	const children = [fiber.type(fiber.props)]
	reconcileChildren(fiber, children)
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
	reconcileChildren(fiber, children)
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
 * @param wipRoot 根节点
 */
export function commitRoot() {
	deletions.forEach(commitDeletion)
	commitWork(wipRoot!.child!)
	// 重新构造一棵树,用于更新props
	currentRoot = wipRoot
	wipRoot = null
	deletions = []
}
function commitDeletion(fiber: Fiber) {
	if (fiber.dom) {
		// 找父级
		let fiberParent: Fiber = fiber.parent as Fiber
		while (!fiberParent?.dom) {
			fiberParent = fiberParent.parent!
		}
		fiberParent.dom!.removeChild(fiber.dom!)
	} else {
		commitDeletion(fiber.child!)
	}
}

export function update() {
	// 更新成新的树
	let currentFiber = wipFiber
	return () => {
		wipRoot = {
			...currentFiber,
			// 记录更新起始点
			alternate: currentFiber,
		} as Fiber
		nextWorkOfUnit = wipRoot
	}
}

export function commitWork(fiber: Fiber) {
	if (!fiber) return
	let fiberParent: Fiber = fiber.parent as Fiber
	while (!fiberParent?.dom) {
		fiberParent = fiberParent.parent!
	}

	if (fiber.effectTag === 'update') {
		updateProps(
			fiber.dom!,
			fiber.props,
			fiber.alternate?.props
		)
	} else if (fiber.effectTag === EFFECTTAG.PLACEMENT) {
		if (fiber.dom) {
			fiberParent.dom.append(fiber.dom)
		}
	}

	commitWork(fiber.child!)
	commitWork(fiber.sibling!)
}

function reconcileChildren(fiber: Fiber, children) {
	let oldFiber = fiber.alternate?.child
	let prevChild: Fiber = {} as Fiber
	children.forEach((child, index) => {
		const isSameType =
			oldFiber && oldFiber.type === child.type
		let newFiber: Fiber = {} as Fiber

		if (isSameType) {
			// NOTE: update
			newFiber = createFiber({
				type: child.type,
				props: child.props,
				dom: oldFiber?.dom,
				child: null,
				sibling: null,
				parent: fiber,
				alternate: oldFiber,
				effectTag: EFFECTTAG.UPDATE,
			}) as Fiber
		} else {
			if (child) {
				newFiber = createFiber({
					type: child.type,
					props: child.props,
					dom: null,
					child: null,
					sibling: null,
					parent: fiber,
					effectTag: EFFECTTAG.PLACEMENT,
				}) as Fiber
			}

			if (oldFiber) {
				// 删除老节点,创建新节点
				deletions.push(oldFiber)
				console.log('should delete', oldFiber)
			}
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
		if (newFiber) {
			prevChild = newFiber
		}
	})

	// 在遍历完新节点的时候可能会存在 其他的老节点,那么就需要全部删除
	while (oldFiber) {
		deletions.push(oldFiber)
		oldFiber = oldFiber.sibling
	}
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
					dom.removeEventListener(eventName, prevProps[key])
					dom.addEventListener(eventName, nextProps[key])
				} else {
					dom[key] = nextProps[key]
				}
			}
		}
	})
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

		if (wipRoot?.sibling?.type === nextWorkOfUnit?.type) {
			// 记录更新终点
			nextWorkOfUnit = undefined
		}

		// console.log(`taskId: ${taskId} is running`)
		shouldYield = deadline.timeRemaining() < 1
	}

	if (!nextWorkOfUnit && wipRoot) {
		// 如果没有下一个任务，那么再添加所有dom节点
		commitRoot()
	}

	requestIdleCallback(workLoop)
}

export function useState(initialValue) {
	let currentFiber = wipFiber
	// 获取之前的值
	const oldHook = currentFiber?.alternate?.stateHook

	const stateHook = {
		state: oldHook ? oldHook.state : initialValue,
	}

	currentFiber!.stateHook = stateHook

	console.log(stateHook)

	function setState(action) {
		stateHook.state = action(stateHook.state)

		wipRoot = {
			...currentFiber,
			alternate: currentFiber,
		} as Fiber

		nextWorkOfUnit = wipRoot
	}

	return [stateHook.state, setState]
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
