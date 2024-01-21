import { proxyRefs } from '../index'
import { shallowReadonly } from '../reactivity/reactive'
import { emit } from './componentEmit' //处理emit
import { initProps } from './componentProps'
import { PublicInstanceProxyHandlers } from './componentPublicInstance'
import { initSlot } from './componentSlots'

// 创建当前组件实例对象
export function createComponentInstance(vnode, parent) {
	const component = {
		//初始化
		vnode, //* 当前组件的虚拟节点
		type: vnode.type, //* 当前虚拟节点的type   object | string
		next: null, //! 下次更新的vnode节点
		setupState: {}, //* 记录setup函数执行后返回的结果
		props: {}, //* 创建props属性,方便instance实例进行初始化props
		slots: {}, //* 创建slots属性,方便instance实例进行初始化slots
		provides: parent ? parent.provides : {}, //! 初始化provides
		parent, //* 父组件
		emit: () => {}, // * 初始化emit
		isMounted: false, //! 挂载标识符 用于组件更新
		subTree: {}, //! elemnt 树
	}
	component.emit = emit.bind(null, component) as any //绑定instance为this 并返回函数   这里emit是从外部引入的emit
	return component
}

export function setupComponent(instance) {
	// TODO
	// initProps()
	console.log(instance)
	// * 初始化props
	initProps(instance, instance.vnode.props)

	//! 初始化slot
	initSlot(instance, instance.vnode.children)

	setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: any) {
	const Component = instance.type

	//* 增加了代理对象
	//cxt
	console.log({ _: 123 })

	console.log({ _: instance })

	instance.proxy = new Proxy( //增加了代理对象
		{ _: instance },

		// get(target, key) {
		//   //setupState
		//   const { setupState } = instance;
		//   if (key in setupState) {
		//     return setupState[key];
		//   }
		//   //key ->$el
		//   if (key === "$el") {
		//     return instance.vnode.el;
		//   }
		// },
		PublicInstanceProxyHandlers
	)

	const { setup } = Component

	if (setup) {
		// currentInstance = instance;
		setCurrentInstance(instance)
		const setupResult = setup(shallowReadonly(instance.props), {
			emit: instance.emit,
		})

		setCurrentInstance(null)

		handleSetupResult(instance, setupResult)
	}
}

function handleSetupResult(instance, setupResult: any) {
	// function Object
	// TODO function
	if (typeof setupResult === 'object') {
		instance.setupState = proxyRefs(setupResult) //setup返回值的ref对象 直接key访问，不用key.value
	}

	finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
	const Component = instance.type
	//如果用户不提供render函数   而是用的template
	if (compiler && !Component.render) {
		if (Component.template) {
			Component.render = compiler(Component.template)
		}
	}

	instance.render = Component.render
}

//借助全局变量获取instccne

let currentInstance = null

export function getCurrentInstance() {
	return currentInstance
}

function setCurrentInstance(instance) {
	currentInstance = instance
}

let compiler

export function registerRuntimeCompiler(_compiler) {
	compiler = _compiler
}
