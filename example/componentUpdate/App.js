//组件更新：
//  首先更新组建的数据 props等
//  其次调用组件的render函数  利用effect 的返回值是runner函数
// 更新时 检测组件是否需要更新


import { h, ref } from '../../lib/mini-vue.esm.js'
import Child from './Child.js'
export const App = {
    name: 'App',

    setup() {

        const msg = ref('123')
        const count = ref(1)
        window.msg = msg

        const changeChildProps = () => {
            msg.value = "456"
        }

        const changeCount = () => {
            count.value++
        }

        return {
            msg,
            count,
            changeChildProps,
            changeCount
        }

    },
    render() {
        return h("div", {}, [


            h("div", {}, '你好'),
            h('button', { onClick: this.changeChildProps }, "change child props"),
            h(Child, { msg: this.msg }), //重点在这
            h("button", { onClick: this.changeCount }, "change self count"),
            h("p", {}, "count: " + this.count),
        ])
    },
}