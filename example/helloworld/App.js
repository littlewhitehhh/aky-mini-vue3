import { h } from "../../lib/mini-vue.esm.js";

window.self = null;
export const App = {
    // .vue
    // <template></template>    ->render

    //render

    render() {
        window.self = this;
        return h(
            "div", {
                id: "root",
                class: ["red", "hard"],
            },
            "hi" + this.msg
            //this.$el    -> get 当前component的 root element
            //string
            // "hi mini-vue"
            //array
            // [
            //     h("p", { class: "red" }, "hi"),
            //     h("p", { class: "hard" }, [h("span", { id: "aaa" }, "hihaha")]),
            // ]
        );
    },

    setup() {
        //composition api
        return {
            msg: "mini-vue 哈哈哈",
        };
    },
};