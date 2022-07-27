export function generate(ast) {
  // let code = "";

  const context: any = createCodegenContext();

  const { push } = context;
  // code += "return";
  push("return ");
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
  const { push } = context;
  // code += ` "${node.content}"`;
  push(`'${node.content}'`);
  // return code;
}
function createCodegenContext() {
  const context = {
    code: "",
    push(source) {
      context.code += source;
    },
  };
  return context;
}
