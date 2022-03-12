import { camelize, capitalize, toHandlerKey } from "../shared/index";

export function emit(instance, event, ...args) {
  // console.log("emit" + event);

  //  instance.props  有没有对应event的回调
  const { props } = instance;

  //tpp  ->
  //先去写一个特定行为 -》 重构通用行为

  // const handler = props["onAdd"];

  //add-foo ->addFoo
  // const camelize = (str: string) => {
  //   return str.replace(/-(\w)/g, (_, c: string) => {
  //     return c ? c.toUpperCase() : "";
  //   });
  // };
  // //addFoo ->AddFoo
  // const capitalize = (str: string) => {
  //   return str.charAt(0).toUpperCase() + str.slice(1);
  // };
  // console.log(capitalize(event));

  // const str = capitalize(camelize(event));
  // AddFoo -> noAddFoo
  // const toHandlerKey = (str: string) => {
  //   return str ? "on" + str : "";
  // };
  //add-foo -> addFoo
  let str = camelize(event);

  //addFoo -> AddFoo
  str = capitalize(str);
  const handlerName = toHandlerKey(str);
  const handler = props[handlerName];
  handler && handler(...args);
}
