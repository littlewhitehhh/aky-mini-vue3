export function transform(root, options = {}) {
  const context = createTransformContext(root, options);

  //1、遍历 ——深度优先搜索  递归
  // 2、修改text content
  traverseNode(root, context);

  createRootChildren(root);
}

function createTransformContext(root: any, options: any) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || [],
  };

  return context;
}

function traverseNode(node: any, context) {
  console.log(node);
  //1.element

  const nodeTransforms = context.nodeTransforms;
  for (let i = 0; i < nodeTransforms.length; i++) {
    const transform = nodeTransforms[i];
    transform(node);
  }

  traverseChildren(node, context);
}

function traverseChildren(node, context) {
  const children = node.children;

  if (children) {
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      traverseNode(node, context);
    }
  }
}
function createRootChildren(root: any) {
  root.codegenNode = root.children[0];
}
