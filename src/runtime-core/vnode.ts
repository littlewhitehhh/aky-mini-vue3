import { isObject } from "../shared/index";
import { shapeFlags } from "../shared/shapeFlags";

export const Fragment = Symbol("Fragment");
export const Text = Symbol("Text");
export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    key: props && props.key,
    shapeFlag: getShapeFlag(type),
    el: null, //$el用的
  };
  //children
  if (typeof children === "string") {
    vnode.shapeFlag = vnode.shapeFlag | shapeFlags.text_children;
  } else if (Array.isArray(children)) {
    vnode.shapeFlag = vnode.shapeFlag | shapeFlags.array_children;
  }

  // 组件 + children 为object类型
  if (vnode.shapeFlag & shapeFlags.stateful_component) {
    if (isObject(children)) {
      vnode.shapeFlag = vnode.shapeFlag | shapeFlags.slot_children;
    }
  }

  return vnode;
}

export function createTextVnode(text: string) {
  return createVNode(Text, {}, text);
}

function getShapeFlag(type) {
  return typeof type === "string" ? shapeFlags.element : shapeFlags.stateful_component;
}
