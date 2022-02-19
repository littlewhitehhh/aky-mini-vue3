//TODO
//老的是 array
//新的是 array

import { h, ref } from "../../lib/mini-vue.esm.js";

// 1、左侧的对比
// (a b) c
//(a,b) d e

const prevChildren = [h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B"), h("p", { key: "C" }, "C")];

const nextChildren = [
    h("p", { key: "A" }, "A"),
    h("p", { key: "B" }, "B"),
    h("p", { key: "D" }, "D"),
    h("p", { key: "E" }, "E"),
];

// const prevChildren = [

//   h("p",{key:"A"},"A"),
//   h("p",{key:"B"},"B"),
//   h("p",{key:"C"},"C"),
// ]

// const nextChildren = [

//   h("p",{key:B},"B"),
//   h("p", { key: "C" }, "C")
// ]

export default {
    name: "ArrayToArray",

    setup() {
        const isChange = ref(false);
        window.isChange = isChange;
        return {
            isChange,
        };
    },

    render() {
        const self = this;
        return self.isChange === true ? h("div", {}, nextChildren) : h("div", {}, prevChildren);
    },
};