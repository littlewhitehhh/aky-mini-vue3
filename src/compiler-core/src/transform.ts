import { NodeTypes } from "./ast";
import { To_Display_String } from "./runtimeHelpers";

export function transform(root, options = {}) {
  const context = createTransformContext(root, options);

  //1、遍历 ——深度优先搜索  递归
  // 2、修改text content
  traverseNode(root, context);

  createRootCodegen(root);

  root.helpers = [...context.helpers.keys()];
}

function createTransformContext(root: any, options: any) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || [],
    helpers: new Map(),
    helper(key) {
      context.helpers.set(key, 1);
    },
  };

  return context;
}

function traverseNode(node: any, context) {
  console.log(node);
  //1.element

  const nodeTransforms = context.nodeTransforms;
  const onExitFns: any = [];
  for (let i = 0; i < nodeTransforms.length; i++) {
    const transform = nodeTransforms[i];
    const onExit = transform(node, context);
    if (onExit) {
      onExitFns.push(onExit);
    }
  }

  switch (node.type) {
    case NodeTypes.INTERPOLATION:
      context.helper(To_Display_String);
      break;
    case NodeTypes.ROOT:
    case NodeTypes.ELEMENT:
      traverseChildren(node, context);
    default:
      break;
  }
  let i = onExitFns.length;
  while (i--) {
    onExitFns[i]();
  }
  // traverseChildren(node, context);
}

function traverseChildren(node, context) {
  const children = node.children;

  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    traverseNode(node, context);
  }
}
function createRootCodegen(root: any) {
  const child = root.children[0];

  if (child.type === NodeTypes.ELEMENT) {
    root.codegenNode = child.codegenNode;
  } else {
    root.codegenNode = root.children[0];
  }
}
