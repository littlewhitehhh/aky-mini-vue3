import { h } from "../../lib/mini-vue.esm.js";

export const App = {
    // .vue
    // <template></template>    ->render

    //render

    render() {
        return h(
            "div", {
                id: "root",
                class: ["red", "hard"],
            },
            // "hi" + this.msg
            //string
            // "hi mini-vue"
            //array
            [
                h("p", { class: "red" }, "hi"),
                h("p", { class: "hard" }, [h("span", { id: "aaa" }, "hihaha")]),
            ]
        );
    },

    setup() {
        //composition api
        return {
            msg: "mini-vue",
        };
    },
};