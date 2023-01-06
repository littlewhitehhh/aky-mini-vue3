import { h, ref } from "../../lib/mini-vue.esm.js";

export const App = {
    name: "App",

    render() {
        // window.self = this;
        // console.log(this.count);   // count refImpl对象        count
        return h("div", { id: "root", ...this.props }, [
            h("button", { onClick: this.onClick }, "click"),
            h("div", {}, "count" + this.count), //  render函数当作依赖，用effect包裹 ==》触发render==》 依赖收集

            //props

            h("button", { onClick: this.onChangePropsDemo1 }, "changeProps - foo的值改变了"),
            h("button", { onClick: this.onChangePropsDemo2 }, "changeProps - foo的值改变了为undefined"),
            h("button", { onClick: this.onChangePropsDemo3 }, "changeProps - bar没有了"),
        ]);
    },
    setup() {
        const count = ref(0);

        const onClick = () => {
            count.value++;
        };

        //props
        const props = ref({
            foo: "foo",
            bar: "bar",
        });

        const onChangePropsDemo1 = () => {
            props.value.foo = "new-foo";
        };
        const onChangePropsDemo2 = () => {
            props.value.foo = "undefined";
        };
        const onChangePropsDemo3 = () => {
            props.value = {
                foo: "foo",
            };
        };
        return {
            count,
            onClick,
            props,
            onChangePropsDemo1,
            onChangePropsDemo2,
            onChangePropsDemo3,
        };
    },
};



/** 
 * 思考1： 什么时候进行更新
 * 响应式对象发生改变，render函数结果就会变化 导致vnode对象发生变化   
 * 所以 我们要怎么获取到之前和之后两个vnode呢？ 
 * 
 * setupRenderEffect函数中的 subTree就是组件render函数的结果 即当前组件的vnode n1
 * 
 *
 * 那么 怎么获取响应式对象改变后的subTree结果呢？ 
 * 通过之前实现的effect函数包裹setupRenderEffect中的逻辑，
 * 当响应式对象发生变化的时候，就会重新执行包裹的逻辑，从而重新执行组件的render函数，生成新的vnode   n2
 *
 *然后进行n1 和 n2 之间的比较   patch（n1,n2,container,parentInstance）-> processElement ->patchElement
 *  
 * 
 * 更新逻辑 ：  可以看作是两个vnode对象之间的对比     n1 n2
 * 
 * 三个方面进行对比
 * type 
 * props
 * children
 * 
 *
 */