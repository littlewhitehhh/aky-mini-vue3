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
 * 但是普通修改render函数 只会修改内部的props和 children  所以一般type不会改变，如果type改变了  会直接当作新的element直接挂在
 * 
 * props   patchProps
 * 1、之前的值和现在的值不一样了   修改了值
 * 遍历新的props，通过key获取到 newProps[key] 和 oldProps[key]
 * newProps[key] ！= oldProps[key]  修改props的值（通过patchProp函数）
 * hostPatchProp(el, key, oldProps[key], newProps[key])
 * 
 * 
 * 2、新的值null || undefined    删除
 * 同上面方法，因为新的props的key值没有发生变化
 * 
 * 
 * 3、之前的值在新的里面没有了  删除
 * 新的props值少了，证明新的props中的key与原来props的key不一样了，新的props的key值少了
 * 这时候我们需要遍历老的props中key，查找当前key在新的props中是否存在
 * newProps[key] === 'undefined'  删除当前key   hostPatchProp(el, key, oldProps[key], null)
 * 
 * 
 * 
 * children
 * children 的类型 包括 string 和 array 两种类型
 * 所以在进行children对比的时候就会产生四种情况
 *  oldChildren  newChildren
 *  string       string
 *  string       array
 *  array        string
 *  array        array 
 *  在updateChildren 的app.js中详细总结
 */