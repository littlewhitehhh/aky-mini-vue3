import { h } from "../../lib/mini-vue.esm.js";
import { Foo } from "./Foo.js";

window.self = null;
export const App = {
    name: "APP",
    // .vue
    // <template></template>    ->render

    //render

    render() {
        window.self = this;
        return h(
            "div", {
                id: "root",
                class: ["red", "hard"],
                onClick: () => {
                    console.log("嘿嘿嘿");
                },
                onMousedown: (e) => {
                    console.log(e.target);
                },
            },
            // "hi" + this.msg
            //this.$el    -> get  当前component的 root element
            //string
            // "hi mini-vue"
            //array
            // [
            //     h("p", { class: "red" }, "hi"),
            //     h("p", { class: "hard" }, [h("span", { id: "aaa" }, "hihaha")]),
            // ]

            [h("div", {}, "hi" + this.msg), h(Foo, { count: 1 })]
        );
    },

    setup() {
        //composition api
        return {
            msg: "mini-vue 哈哈哈",
        };
    },
};