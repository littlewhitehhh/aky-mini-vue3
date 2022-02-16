import { h, createTextVnode } from "../../lib/mini-vue.esm.js";
import { Foo } from "./Foo.js";
export const App = {
    name: "App",

    render() {
        const app = h("div", {}, "App");

        //怎么使用插槽   ---- 把对应的内容放到对应的组件的children中
        //希望children里面的p标签能够在foo组件中渲染出来

        //传入单值
        // const foo = h(Foo, {}, h("p", {}, "123"));

        // 传入数组
        // const foo = h(Foo, {}, [h("p", {}, "123"), h("p", {}, 456)]);

        //具名插槽   需要知道key value   所以用到obj
        // const foo = h(
        //     Foo, {}, {
        //         header: h("p", {}, "header"),
        //         footer: h("p", {}, "footer"),
        //     }
        // );

        //作用域插槽
        const foo = h(
            Foo, {}, {
                // header: ({ age }) => h("p", {}, "header" + age),
                header: ({ age }) => h("p", {}, "header" + age),

                // footer: () => [h("p", {}, "footer"), createTextVnode("你好呀！")],
            }
        );
        return h("div", {}, [app, foo]);
    },
    setup() {
        return {};
    },
};