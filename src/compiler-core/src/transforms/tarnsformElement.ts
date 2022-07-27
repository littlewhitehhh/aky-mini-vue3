import { createVNodeCall, NodeTypes } from "../ast";
import { Create_ELEMENT_Vnode } from "../runtimeHelpers";

export function transformElement(node, context) {
  if (node.type === NodeTypes.ELEMENT) {
    return () => {
      context.helper(Create_ELEMENT_Vnode);
      // 中间处理层
      const vnodeTag = `"${node.tag}"`;
      //props
      let vnodeProps;

      // children
      const children = node.children;
      let vnodeChildren = children[0];

      // const vnodeElement = {
      //   type: NodeTypes.ELEMENT,
      //   tag: vnodeTag,
      //   prpos: vnodeProps,
      //   children: vnodeChildren,
      // };
      node.codegenNode = createVNodeCall(context, vnodeTag, vnodeProps, vnodeChildren);
    };
  }
}
