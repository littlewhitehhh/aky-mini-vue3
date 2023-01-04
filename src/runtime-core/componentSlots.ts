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
