import { h } from "../../lib/mini-vue.esm.js";
import { Foo } from "./Foo.js";
export const App = {
    name: "App",

    render() {
        //emit

        return h("div", {}, [
            h("div", {}, "App"),
            h(Foo, {
                //props
                //emit
                onAdd(num1, num2) {
                    console.log("onAdd", num1, num2);
                },
                onAddFoo() {
                    console.log("onAddFoo");
                },
            }),
        ]);
    },

    setup() {
        return {};
    },
};