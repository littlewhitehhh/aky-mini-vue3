//TODO
//老的是 array
//新的是 array

import { h, ref } from "../../lib/mini-vue.esm.js";

// 1、左侧的对比
// (a b) c
//(a,b) d e

// const prevChildren = [h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B"), h("p", { key: "C" }, "C")];

// const nextChildren = [
//     h("p", { key: "A" }, "A"),
//     h("p", { key: "B" }, "B"),
//     h("p", { key: "D" }, "D"),
//     h("p", { key: "E" }, "E"),
// ];

//2、右侧对比
// a (b c)
//d e (b c)
// const prevChildren = [h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B"), h("p", { key: "C" }, "C")];
// const nextChildren = [
//     h("p", { key: "D" }, "D"),
//     h("p", { key: "E" }, "E"),
//     h("p", { key: "B" }, "B"),
//     h("p", { key: "C" }, "C"),
// ];

//3、新的比老的长
//(a b)
//(a b) c
// const prevChildren = [h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B")];
// const nextChildren = [h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B"), h("p", { key: "C" }, "C")];

//(a b)
//c (a b)
// const prevChildren = [h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B")];
// const nextChildren = [h("p", { key: "C" }, "C"), h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B")];

//4、老的比新的长
//(a b) c
//(a b)
// const prevChildren = [h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B"), h("p", { key: "C" }, "C")];
// const nextChildren = [h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B")];

//c (a b)
//(a b)
// const prevChildren = [h("p", { key: "C" }, "C"), h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B")];
// const nextChildren = [h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B")];

//5、对比中间部分
//删除老的(在老的里面存在，新的里面不存在)
//5.1
//a b (c d) f g
//a b (e c) f g
//D节点在新的里面没有的 -需要删除
//C节点props也发生了变化
// const prevChildren = [
//     h("p", { key: "A" }, "A"),
//     h("p", { key: "B" }, "B"),
//     h("p", { key: "C", id: "c-prev" }, "C"),
//     h("p", { key: "D" }, "D"),
//     h("p", { key: "F" }, "F"),
//     h("p", { key: "G" }, "G"),
// ];
// const nextChildren = [
//     h("p", { key: "A" }, "A"),
//     h("p", { key: "B" }, "B"),
//     h("p", { key: "E" }, "E"),
//     h("p", { key: "C", id: "c-next" }, "C"),
//     h("p", { key: "F" }, "F"),
//     h("p", { key: "G" }, "G"),
// ];
// 5.1.1
// a,b,(c,e,d),f,g
// a,b,(e,c),f,g
// 中间部分，老的比新的多， 那么多出来的直接就可以被干掉(优化删除逻辑)
// const prevChildren = [
//     h("p", { key: "A" }, "A"),
//     h("p", { key: "B" }, "B"),
//     h("p", { key: "C", id: "c-prev" }, "C"),
//     h("p", { key: "E" }, "E"),
//     h("p", { key: "D" }, "D"),
//     h("p", { key: "F" }, "F"),
//     h("p", { key: "G" }, "G"),
// ];

// const nextChildren = [
//     h("p", { key: "A" }, "A"),
//     h("p", { key: "B" }, "B"),
//     h("p", { key: "E" }, "E"),
//     h("p", { key: "C", id: "c-next" }, "C"),
//     h("p", { key: "F" }, "F"),
//     h("p", { key: "G" }, "G"),
// ];

// 5.2 移动 (节点存在于新的和老的里面，但是位置变了)
// 2.1
// a,b,(c,d,e),f,g
// a,b,(e,c,d),f,g
// 最长子序列： [1,2]

// const prevChildren = [
//     h("p", { key: "A" }, "A"),
//     h("p", { key: "B" }, "B"),
//     h("p", { key: "C" }, "C"),
//     h("p", { key: "D" }, "D"),
//     h("p", { key: "E" }, "E"),
//     h("p", { key: "F" }, "F"),
//     h("p", { key: "G" }, "G"),
// ];

// const nextChildren = [
//     h("p", { key: "A" }, "A"),
//     h("p", { key: "B" }, "B"),
//     h("p", { key: "E" }, "E"),
//     h("p", { key: "C" }, "C"),
//     h("p", { key: "D" }, "D"),
//     h("p", { key: "F" }, "F"),
//     h("p", { key: "G" }, "G"),
// ];
// 3. 创建新的节点
// a,b,(c,e),f,g
// a,b,(e,c,d),f,g
// d 节点在老的节点中不存在，新的里面存在，所以需要创建
// const prevChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "E" }, "E"),
//   h("p", { key: "F" }, "F"),
//   h("p", { key: "G" }, "G"),
// ];

// const nextChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "E" }, "E"),
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "F" }, "F"),
//   h("p", { key: "G" }, "G"),
// ];

// 综合例子
// a,b,(c,d,e,z),f,g
// a,b,(d,c,y,e),f,g

const prevChildren = [
    h("p", { key: "A" }, "A"),
    h("p", { key: "B" }, "B"),
    h("p", { key: "C" }, "C"),
    h("p", { key: "D" }, "D"),
    h("p", { key: "E" }, "E"),
    h("p", { key: "Z" }, "Z"),
    h("p", { key: "F" }, "F"),
    h("p", { key: "G" }, "G"),
];

const nextChildren = [
    h("p", { key: "A" }, "A"),
    h("p", { key: "B" }, "B"),
    h("p", { key: "D" }, "D"),
    h("p", { key: "C" }, "C"),
    h("p", { key: "aky" }, "aky"),
    h("p", { key: "Y" }, "Y"),
    h("p", { key: "E" }, "E"),
    h("p", { key: "F" }, "F"),
    h("p", { key: "G" }, "G"),
];



//fix c节点应该是move 而不是移除后创建

// const prevChildren = [
//     h("p", { key: "A" }, "A"),
//     h("p", {}, "C"),

//     h("p", { key: "B" }, "B"),

//     h("p", { key: "D" }, "D"),

// ];

// const nextChildren = [
//     h("p", { key: "A" }, "A"),

//     h("p", { key: "B" }, "B"),
//     h("p", {}, "C"),

//     h("p", { key: "D" }, "D"),


// ];
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
        return self.isChange === true ?
            h("div", {}, nextChildren) :
            h("div", {}, prevChildren);
    },
};