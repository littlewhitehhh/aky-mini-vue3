import { Create_ELEMENT_Vnode } from "./runtimeHelpers";

export const enum NodeTypes {
  INTERPOLATION,
  SIMPLE_EXPRESSION,
  ELEMENT,
  TEXT,
  ROOT,
  COMPOUND_EXPRESSION,
}

export function createVNodeCall(context, tag, props, children) {
  context.helper(Create_ELEMENT_Vnode);

  return {
    type: NodeTypes.ELEMENT,
    tag,
    props,
    children,
  };
}
