import { hasOwn } from '../shared/index.js'

const PublicPropertiesMap = {
	$el: (i) => i.vnode.el,
	$slots: (i) => i.slots,
	$props: (i) => i.props,
}

// *  proxy的getter方法   get(target,key)
export const PublicInstanceProxyHandlers = {
	get({ _: instance }, key) {
		//这里的_：instance是解构
		// console.log("instance:", instance);

		//setupState
		const { setupState, props } = instance
		// if (key in setupState) {
		//   return setupState[key];
		// }

		if (hasOwn(setupState, key)) {
			return setupState[key]
		} else if (hasOwn(props, key)) {
			return props[key]
		}

		//key ->$el
		const publicGetter = PublicPropertiesMap[key]
		if (publicGetter) {
			return publicGetter(instance)
		}
	},
}
