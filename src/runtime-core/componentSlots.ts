import { shapeFlags } from "../shared/shapeFlags";

export function initSlot(instance, children) {
  // instance.slots = Array.isArray(children) ? children : [children];

  //children  Object

  // const slots = {};
  // for (const key in children) {
  //   const value = children[key];

  //   slots[key] = normalizeSlotsValue(value);
  // }

  //
  // const { vnode } = instance;
  // if (vnode.shapeFlag & shapeFlags.slot_children) {
  // console.log("isntance.slots:" + instance.slots);

  normalizeObjectSlots(children, instance.slots);
  // }
  // instance.slots = slots;
}

function normalizeObjectSlots(children, slots) {
  // console.log("isntance.slots:" + JSON.stringify(slots));\
  console.log("children", children);

  for (const key in children) {
    const value = children[key];
    slots[key] = (props) => normalizeSlotsValue(value(props));
    // slots[key] = (props) => normalizeSlotsValue(value);

    console.log("isntance.slots:" + slots);
  }
}
function normalizeSlotsValue(value) {
  return Array.isArray(value) ? value : [value];
}

/**
 * 父组件通过children 传递 slot  类型为对象类型
 *
 * {
 *    key:(props)=>{h()}
 *  }
 * 通过遍历将所有插槽通过 key value的形式 保存在instance.slot对象中 使用this.$slots可以访问得到
 * 在子组件中进行插槽渲染的时候 通过renderSlots(this.$slots,name,props)函数
 * 每一个slot  都是一个函数， renderSlots函数中会执行插槽函数 生成vnode对象或者vnode对象组成的数组result
 * 然后将生成的结果通过createVnode(Fragment,{},result)包裹成vnode对象
 *
 *  又因为 result是vnode对象或者vnode对象组成的数组，
 * createVnode 传入的children 只能是数组或者string
 * 所有如果是vnode对象则需要先包裹一个[]数组，normalizeSlotsValue就是这个职责
 *
 */
