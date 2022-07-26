import { NodeTypes } from "./ast";

export function baseParse(content: string) {
  //message
  const context = createParseContext(content); //{ source:message}
  //重构
  return createRoot(parseChildren(context)); //
  // return {
  //   children: [
  //     {
  //       type: "interpolation",
  //       content: { type: "simple_expression", content: "message" },
  //     },
  //   ],
  // };

  // return createRoot([
  //   {
  //     type: "interpolation",
  //     content: { type: "simple_expression", content: "message" },
  //   },
  // ]);
}

function createParseContext(content): any {
  return {
    source: content,
  };
}
function createRoot(children) {
  return {
    children,
  };
}

function parseChildren(context) {
  const nodes: any = [];
  let node;
  if (context.source.startsWith("{{")) {
    node = parseInterpolation(context);
  }

  nodes.push(node);
  return nodes;
  // return [
  //   {
  //     type: "interpolation",
  //     content: { type: "simple_expression", content: "message" },
  //   },
  // ];
}
function parseInterpolation(context) {
  console.log(context);

  const openDelimiter = "{{";
  const closeDelimiter = "}}";

  //{{message}}解析
  const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length);

  advanceBy(context, openDelimiter.length);

  // context.source = context.source.slice(openDelimiter.length); // message}}
  console.log(context.source);

  const rawContentLength = closeIndex - openDelimiter.length;
  const rawContent = context.source.slice(0, rawContentLength); // messag

  //边缘处理  利于 {{ message}}  双括号中有空格
  const content = rawContent.trim();
  console.log(content);

  // 例如{{message}}</div>   {{message}}处理完毕的 删除掉 剩下</div>
  // context.source = context.source.slice(rawContentLength + openDelimiter.length);
  advanceBy(context, rawContentLength + openDelimiter.length);
  console.log("context.source", context.source);

  return {
    type: NodeTypes.INTERPOLATION, //"interpolation"
    content: { type: NodeTypes.SIMPLE_EXPRESSION, content: content }, //"simple_expression"
  };
}

function advanceBy(context: any, length: number) {
  context.source = context.source.slice(length);
}
