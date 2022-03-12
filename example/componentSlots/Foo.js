import { h, renderSlots } from "../../lib/mini-vue.esm.js";

export const Foo = {
    name: "Foo",
    render() {
        const foo = h("p", {}, "foo");

        //Foo .vnode .children
        // console.log(this);
        console.log(this.$slots);
        // children  -> vnode
        // 内部到处renderSlots

        return h("div", {}, [foo, h("div", {}, renderSlots(this.$slots))]);

        const age = 18;
        // renderSlots
        //1、获取到要渲染的元素
        //2、获取到渲染的位置

        // return h("div", {}, [renderSlots(this.$slots, "header", { age }), foo, renderSlots(this.$slots, "footer")]);

        // return h("div", {}, [renderSlots(this.$slots, "header", { age }), foo, renderSlots(this.$slots, "footer")]);
    },

    setup() {
        return {};
    },
};