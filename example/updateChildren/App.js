import { h, ref } from '../../lib/mini-vue.esm.js'

import ArrayToText from './ArrayToText.js'
import TextToArray from './TextToArray.js'
import TextToText from './TextToText.js'
import ArrayToArray from './ArrayToArray.js'
export const App = {
	name: 'App',

	render() {
		return h('div', { tId: 1 }, [
			h('p', {}, '主页'),
			// h('button', { onClick: this.changeCount }, 'change self count'),

			//老的节点是array，新的节点是text
			// h(ArrayToText),
			//老的节点是text，新的节点是text
			// h(TextToText),
			//老的节点是text，新的节点是array
			// h(TextToArray),
			//老的节点是array，新的节点是array
			h(ArrayToArray),
		])
	},

	setup() {
		// const count = ref('false')
		// window.count = count
		// const changeCount = () => {
		// 	count = !this.count.value
		// }
		// return {
		// 	changeCount,
		// 	count,
		// }
	},
}

/**
 * children的更新逻辑   patchChildren(n1,n2,container,parentComponent)
 *
 * 新节点children类型  shapeFlag = n2.shapeFlag
 * 老节点children类型  prevShapeFlag = n1.shapeFlag
 * 老节点children  c1 = n1.children
 * 新节点children  c2 = n2.children
 *
 *
 * 1、 array to text
 * 首先我们需要判断新老children的类型是text 还是 array类型
 * 通过vnode.shapeFlag来判断
 *
 * 通过 shapeFlag & ShapeFlags.text_children  判断为text类型
 * 再判断 prevShapeFlag & ShapeFlags.array_children  判断老节点是否为array类型
 *
 * 删除老节点children
 * 添加新节点children
 *
 *
 * 2 text to text
 * 通过shapeFlag 和 prevShapeFlag 判断都为text类型
 *
 * 然后判断 n1.children != n2.children
 * 直接修改el.textContent = n2.children
 *
 *
 * 3、 text to array
 * shapeFlag & ShapeFlags.array_children  判断为array的类型
 * prevShapeFlag & ShapeFlags.text_children  判断为text类型
 *
 * 清空老节点   setElementText(container, "");
 * 添加新节点   遍历c2  然后patch(null,v,container,parentComponent)
 *
 *
 * 4、 array to array  最复杂滴
 * 分为 无key 和 有key 两种情况
 * 4.1无key
 * 4.2 有key
 *
 * 详细见array to array
 */
