export function createVNode(type, prop?, children?) {
  const vnode = {
    type,
    prop,
    children,
  };
  return vnode;
}
