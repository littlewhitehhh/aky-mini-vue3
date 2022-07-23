import { h, renderSlots } from "../../lib/mini-vue.esm.js";


//插槽本质  就是将Appjs中 Foo组件的children const foo = h(Foo, {}, h("p", {}, "123"));
// 插入到 Foo组件中 element vnode subtree中children
export const Foo = {
    name: "Foo",
    render() {
        const foo = h("p", {}, "foo");

        //Foo .vnode .children
        // console.log(this);
        console.log("+++++++++:" +
            JSON.stringify(this.$slots));
        // children  -> vnode
        // 内部到处renderSlots
        // console.log(this.$slots);
        // return h("div", {}, [foo, h("div", {}, this.$slots)]);
        // return h("div", {}, [foo, h("div", {}, renderSlots(this.$slots))]);

        const age = 18
            // renderSlots
            //1、获取到要渲染的元素
            //2、获取到渲染的位置

        return h("div", {}, [renderSlots(this.$slots, "header", { age }), foo, renderSlots(this.$slots, "footer")]);

        // return h("div", {}, [renderSlots(this.$slots, "header", { age }), foo, renderSlots(this.$slots, "footer")]);
    },

    setup() {
        return {};
    },
};