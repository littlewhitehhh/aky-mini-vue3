// import { isString } from "../../shared";
// import { NodeTypes } from "./ast";
// import { Create_ELEMENT_Vnode, helperMapName, To_Display_String } from "./runtimeHelpers";

// export function generate(ast) {
//   // let code = "";
//   const context: any = createCodegenContext();
//   const { push } = context;

//   // const VueBinging = "Vue";
//   // // const helpers = ["toDisplayString"];
//   // const aliasHelper = (s) => `${s}:_${s}`;
//   // push(`const ${ast.helpers.map(aliasHelper).join(",")}= ${VueBinging} `);
//   // push("\n");
//   // // code += "return";
//   // push("return ");

//   //重构
//   genFunctionPreamble(context, ast);

//   const functionName = "render";
//   const args = ["_cxt", "_cache"];
//   const signature = args.join(",");

//   push(`function ${functionName}(${signature}){`);
//   // code += ` function ${functionName}(${signature}){`;

//   console.log(ast);

//   // code += `return`;
//   push(`return `);
//   genNode(ast.codegenNode, context);
//   // code += "}";
//   push("}");

//   return {
//     // code: `return function render(_cxt,_cache,$props,$setup,$data,,$options){
//     //   return "hi"
//     // }`,
//     code: context.code,
//   };
// }
// function genNode(node: any, context: any) {
//   switch (node.type) {
//     case NodeTypes.TEXT:
//       genText(context, node);
//       break;
//     case NodeTypes.INTERPOLATION:
//       genInterpolation(node, context);
//       break;
//     case NodeTypes.SIMPLE_EXPRESSION:
//       genExpression(node, context);
//       break;
//     case NodeTypes.ELEMENT:
//       genElement(node, context);
//       break;
//     case NodeTypes.COMPOUND_EXPRESSION:
//       genCompoundExpression(node, context);
//       break;
//     default:
//       break;
//   }
// }
// function createCodegenContext() {
//   const context = {
//     code: "",
//     push(source) {
//       context.code += source;
//     },
//     helper(key) {
//       return `_${helperMapName[key]}`;
//     },
//   };
//   return context;
// }

// function genFunctionPreamble(context: any, ast: any) {
//   const VueBinging = "Vue";
//   // const helpers = ["toDisplayString"];
//   const { push } = context;
//   const aliasHelper = (s) => `${helperMapName[s]}:_${helperMapName[s]}`;

//   if (ast.helpers.length > 0) {
//     push(`const {${ast.helpers.map(aliasHelper).join(",")}}= ${VueBinging} `);
//   }

//   push("\n");
//   // // code += "return";
//   push("return ");
// }
// function genText(context, node) {
//   const { push } = context;
//   // code += ` "${node.content}"`;
//   push(`'${node.content}'`);
//   // return code;
// }

// function genInterpolation(node: any, context: any) {
//   const { push, helper } = context;
//   console.log(node);

//   push(`_${helper(To_Display_String)}(`);
//   genNode(node.content, context);
//   push(")");
// }

// function genExpression(node: any, context: any): any {
//   const { push } = context;

//   push(`${node.content}`);
// }

// function genElement(node: any, context: any) {
//   const { push, helper } = context;

//   const { tag, children, props } = node;

//   push(`${helper(Create_ELEMENT_Vnode)}(`);
//   genNodeList(genNullable([tag, props, children]), context);
//   // genNode(children, context);
//   // for (let i = 0; i < children.length; i++) {
//   //   const child = children[i];

//   //   genNode(child, context);
//   // }

//   push(")");
// }
// function genCompoundExpression(node: any, context: any) {
//   const { children } = node;
//   const { push } = context;
//   for (let i = 0; i < children.length; i++) {
//     const child = children[i];
//     if (isString(child)) {
//       push(child);
//     } else {
//       genNode(child, context);
//     }
//   }
// }
// function genNullable(args: any[]) {
//   return args.map((arg) => {
//     arg || "null";
//   });
// }

// function genNodeList(nodes, context) {
//   const { push } = context;
//   for (let i = 0; i < nodes.length; i++) {
//     const node = nodes[i];
//     if (isString(node)) {
//       push(node);
//     } else {
//       genNode(node, context);
//     }
//     if (i < nodes.length - 1) {
//       push(",");
//     }
//   }
// }

import { isString } from "../../shared";
import { NodeTypes } from "./ast";
import { Create_ELEMENT_Vnode, helperMapName, To_Display_String } from "./runtimeHelpers";

export function generate(ast) {
  const context = createCodegenContext();
  const { push } = context;

  genFunctionPreamble(ast, context);

  const functionName = "render";
  const args = ["_ctx", "_cache"];
  const signature = args.join(", ");

  push(`function ${functionName}(${signature}){`);
  push("return ");
  genNode(ast.codegenNode, context);
  push("}");

  return {
    code: context.code,
  };
}

function genFunctionPreamble(ast, context) {
  const { push } = context;
  const VueBinging = "Vue";
  const aliasHelper = (s) => `${helperMapName[s]}:_${helperMapName[s]}`;
  if (ast.helpers.length > 0) {
    push(`const { ${ast.helpers.map(aliasHelper).join(", ")} } = ${VueBinging}`);
  }
  push("\n");
  push("return ");
}

function createCodegenContext(): any {
  const context = {
    code: "",
    push(source) {
      context.code += source;
    },
    helper(key) {
      return `_${helperMapName[key]}`;
    },
  };

  return context;
}

function genNode(node: any, context) {
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context);
      break;
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context);
      break;
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context);
      break;
    case NodeTypes.ELEMENT:
      genElement(node, context);
      break;
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(node, context);
      break;

    default:
      break;
  }
}

function genCompoundExpression(node: any, context: any) {
  const { push } = context;
  const children = node.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (isString(child)) {
      push(child);
    } else {
      genNode(child, context);
    }
  }
}

function genElement(node: any, context: any) {
  const { push, helper } = context;
  const { tag, children, props } = node;
  push(`${helper(Create_ELEMENT_Vnode)}(`);
  genNodeList(genNullable([tag, props, children]), context);
  push(")");
}

function genNodeList(nodes, context) {
  const { push } = context;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (isString(node)) {
      push(node);
    } else {
      genNode(node, context);
    }

    if (i < nodes.length - 1) {
      push(", ");
    }
  }
}

function genNullable(args: any) {
  return args.map((arg) => arg || "null");
}

function genExpression(node: any, context: any) {
  const { push } = context;
  push(`${node.content}`);
}

function genInterpolation(node: any, context: any) {
  const { push, helper } = context;
  push(`${helper(To_Display_String)}(`);
  genNode(node.content, context);
  push(")");
}

function genText(node: any, context: any) {
  const { push } = context;
  push(`'${node.content}'`);
}
