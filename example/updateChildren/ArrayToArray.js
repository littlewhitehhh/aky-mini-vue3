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

/**
 * 4.1  无key情况
 * 
 * 获取新节点数组长度，获取就节点数组的长度
 * 取两个长度中较小的长度值
 * 从0位置开始一次进行比较 for(i=0;i<=commonLength; i++)  然后patch 
 * 
 * 逻辑本质就是：
 *  如果新节点个数 > 新节点个数，移除多余的节点
 *  如果旧节点个数 < 新节点个数，增加节点
 * 4.2 有key情况 （复杂的嘞）
 *   
 * a,b(c,d,e,,z,y)f,g
 * a,b(d,c,y,e)f,g
 * 
 * 新节点children  c2
 * 旧节点children  c1
 * 就节点children长度  l1 = c1.length
 * 新节点children长度  l2 = c2.length
 * 
 * e1 = c1.length -1
 * e2 = c2.length -1
 * 三指针对比 
 * 
 * 1、左侧对比     
 * 条件是：while( i<=e1 && i<=e2 )   
 * n1 = c1[i] 是否与 n2 = c2[i] 相同   isSameVnode(n1,n2) （type和key相同 判断段isSame）
 * if(isSameVnode === true)   patch（n1,n2,container,parentComponent）
 * else break 退出循环
 * i++
 * 
 * 综合案例  此时  i=2时 退出循环   e1 = 9 ； e2 = 8
 * 
 * 
 * 2、右侧对比
 * 此时 先进行过左侧的对比了  此时左侧已经对比出不同的节点了，i的值确定了 
 * 例如综合案例  i=确定了
 * 在进行右侧对比   e1=9 e2 =8
 * 条件依然是： while( i <=e1 && i<=e2)
 * n1 = c1[e1]  n2 = c2[e2]
 * if(isSameVndoe(n1,n2)===true)   patch(n1,n2,container,parentComponent)
 * else break  退出循环
 * e1 --
 * e2 --
 * 
 * 综合案例  此时 i= 2  e1=7  e2 = 6
 * 
 * 
 * 3、新的比老的多  
 * eg  a b              a b
 *     a b （c d）     （ c d） a b
 * 
 * 在左侧对比和右侧对比完成后 出现的一种情况
 * 如果 e1< i <= e2 证明新节点多与老节点
 * if( i > e1){
 *      if( i <=e2) {   
 *          新的比老的多，直接创建新的节点(多个一个甚至多个)，
 *          并且把新节点创建在它指定的位置
 *  }
 * }
 * 
 * 
 * 4、老的比新的多
 * 在左侧对比和右侧对比完成后 出现的一种情况
 * 如果 i >e2   i<=e1
 * else if(i>e2){
 *  while(i<e1){
 *  删除老节点 remove(c1[i].el)
 *  i++
 *  }
 * }
 * 
 * 3，4情况只会出现一种
 * 
 * 
 * 5 中间对比(乱序部分)
 * 
 * 
 * 
 * 
 * 
 * 左侧对比
 * while(){} 
 * 
 * 右侧对比
 * while(){}{}
 * 
 * 左右侧对比完成后
 * 如果此时  i >e1 同时 i<=e2，证明 新节点比老节点长
 * 新建新的节点
 * if(i>e1){
 *   if(i <=e2){
 *      while(1<=e2){
 *        创建新节点
 *          i++
 *      }
 *   }
 * } 
 * }else if( i >e2){  如果此时  i >e2 同时 i<=e1，证明 老节点比新节点长
 *    删除老节点 
 *  while( i <=e1){
 *   删除老节点
 *      i++  
 *  }
 * }
 */