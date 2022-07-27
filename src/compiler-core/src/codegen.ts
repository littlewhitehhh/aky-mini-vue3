import { NodeTypes } from "./ast";
import { helperMapName, To_Display_String } from "./runtimeHelpers";

export function generate(ast) {
  // let code = "";
  const context: any = createCodegenContext();
  const { push } = context;

  // const VueBinging = "Vue";
  // // const helpers = ["toDisplayString"];
  // const aliasHelper = (s) => `${s}:_${s}`;
  // push(`const ${ast.helpers.map(aliasHelper).join(",")}= ${VueBinging} `);
  // push("\n");
  // // code += "return";
  // push("return ");

  //重构
  genFunctionPreamble(context, ast);

  const functionName = "render";
  const args = ["_cxt", "_cache"];
  const signature = args.join(",");

  push(`function ${functionName}(${signature}){`);
  // code += ` function ${functionName}(${signature}){`;

  console.log(ast);

  // code += `return`;
  push(`return `);
  genNode(ast.codegenNode, context);
  // code += "}";
  push("}");

  return {
    // code: `return function render(_cxt,_cache,$props,$setup,$data,,$options){
    //   return "hi"
    // }`,
    code: context.code,
  };
}
function genNode(node: any, context: any) {
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(context, node);
      break;
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context);
      break;
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context);
      break;
    default:
      break;
  }
}
function createCodegenContext() {
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

function genFunctionPreamble(context: any, ast: any) {
  const VueBinging = "Vue";
  // const helpers = ["toDisplayString"];
  const { push } = context;
  const aliasHelper = (s) => `${helperMapName[s]}:_${helperMapName[s]}`;

  if (ast.helpers.length > 0) {
    push(`const ${ast.helpers.map(aliasHelper).join(",")}= ${VueBinging} `);
  }

  push("\n");
  // // code += "return";
  push("return ");
}
function genText(context, node) {
  const { push } = context;
  // code += ` "${node.content}"`;
  push(`'${node.content}'`);
  // return code;
}

function genInterpolation(node: any, context: any) {
  const { push, helper } = context;
  console.log(node);

  push(`_${helper(To_Display_String)}(`);
  genNode(node.content, context);
  push(")");
}

function genExpression(node: any, context: any): any {
  const { push } = context;

  push(`${node.content}`);
}
