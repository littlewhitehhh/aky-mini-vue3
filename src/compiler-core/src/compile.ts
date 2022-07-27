import { generate } from "./codegen";
import { baseParse } from "./parse";
import { transform } from "./transform";
import { transformElement } from "./transforms/tarnsformElement";
import { transformExpression } from "./transforms/transformExpression";
import { transformText } from "./transforms/transfromText";

export function baseCompile(template) {
  const ast: any = baseParse(template);
  transform(ast, {
    nodeTransforms: [transformExpression, transformElement, transformText],
  });
  console.log("ast_______", ast);

  return generate(ast);
}
