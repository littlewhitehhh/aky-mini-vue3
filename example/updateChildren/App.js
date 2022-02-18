import { h } from "../../lib/mini-vue.esm.js";

import ArrayToText from "./ArrayToText.js";
import TextToArray from "./TextToArray.js";
import TextToText from "./TextToText.js";
export const App = {
    name: "App",

    render() {
        return h("div", { tId: 1 }, [
            h("p", {}, "主页"),
            //老的节点是array，新的节点是text
            // h(ArrayToText),
            //老的节点是text，新的节点是text
            // h(TextToText),
            //老的节点是text，新的节点是array
            h(TextToArray),
            //老的节点是array，新的节点是array
        ]);
    },

    setup() {},
};