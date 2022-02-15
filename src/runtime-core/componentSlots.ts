import { shapeFlags } from "../shared/shapeFlags";

export function initSlot(instance, children) {
  // instance.slots = Array.isArray(children) ? children : [children];

  //children  Object

  // const slots = {};
  // for (const key in children) {
  //   const value = children[key];

  //   slots[key] = normalizeSlotsValue(value);
  // }
  // instance.slots = slots

  const { vnode } = instance;
  if (vnode.shapeFlag & shapeFlags.slot_children) {
    normalizeObjectSlots(children, instance.slots);
  }
}

function normalizeObjectSlots(children, slots) {
  for (const key in children) {
    const value = children[key];
    slots[key] = (props) => normalizeSlotsValue(value(props));
  }
}
function normalizeSlotsValue(value) {
  return Array.isArray(value) ? value : [value];
}
