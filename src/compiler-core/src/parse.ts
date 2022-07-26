import { NodeTypes } from "./ast";

const enum TagType {
  Start,
  End,
}

export function baseParse(content: string) {
  //message
  const context = createParseContext(content); //{source:message}
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
  //解析插值{{}}
  if (context.source.startsWith("{{")) {
    node = parseInterpolation(context);
  } else if (context.source[0] === "<") {
    //element类型
    if (/[a-z]/.test(context.source[1])) {
      console.log("parse.element");
      node = parseElement(context);
    }
  }
  // } else {
  //   //text类型
  //   node = parseText(context);
  // }
  if (!node) {
    node = parseText(context);
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

//element类型parse
function parseElement(context: any) {
  //implement    <div></div>
  // 1、解析tag
  // 2、删除处理完成的代码

  //1
  // const match: any = /^<([a-z]*)/i.exec(context.source); //
  // console.log(match); // [ '<div', 'div', index: 0, input: '<div></div>', groups: undefined ]
  // const tag = match[1];
  // console.log(tag); //div

  // //2  删除处理完成的代码
  // advanceBy(context, match[0].length);
  // console.log(context.source); //></div>
  // advanceBy(context, 1);
  // console.log(context.source); // </div>

  // return {
  //   type: NodeTypes.ELEMENT,
  //   tag,
  // };

  // 重构
  const element = parseTag(context, TagType.Start);
  parseTag(context, TagType.End);
  console.log("-------", context.source);

  return element;
}

function parseTag(context: any, TagType) {
  //implement    <div></div>
  // 1、解析tag
  // 2、删除处理完成的代码

  //1
  const match: any = /^<\/?([a-z]*)/i.exec(context.source);
  console.log(match); // [ '<div', 'div', index: 0, input: '<div></div>', groups: undefined ]
  const tag = match[1];
  console.log(tag); //div

  // 2
  advanceBy(context, match[0].length); //></div>

  advanceBy(context, 1); //</div>

  if (tag === TagType.End) return;

  return {
    type: NodeTypes.ELEMENT,
    tag,
  };
}

//{{}}插值类型parse
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
  // const rawContent = context.source.slice(0, rawContentLength); // message
  const rawContent = parseTextData(context, rawContentLength);

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

//TEXT类型parse
function parseText(context) {
  //1、获取content
  //2、推进代码  ： 删除已经处理的代码

  //1
  // const content = context.source.slice(0, context.source.length);
  // console.log(content);

  //2
  // advanceBy(context, content.length);
  // console.log(context.source);

  //重构
  const content = parseTextData(context, context.source.length);

  return {
    type: NodeTypes.TEXT,
    content,
  };
}

//推进工具函数
function advanceBy(context: any, length: number) {
  context.source = context.source.slice(length);
}

//裁剪工具函数
function parseTextData(context, length) {
  const content = context.source.slice(0, length);

  advanceBy(context, length);
  return content;
}
