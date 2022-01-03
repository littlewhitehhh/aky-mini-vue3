// import { track, trigger } from "./effect";
import { isObject } from "../shared/index";
import {
  mutableHandlers,
  readonlyHandlers,
  shallowReactiveHandlers,
  shallowReadonlyHandlers,
} from "./baseHandler";
// import { track, trigger } from "./effect";

/**
 * reative 和 readonly 的get和set重复代码较多，进行代码抽取重构
 *
 */

// 工具函数
function createReactiveObject(target, baseHandler) {
  if (!isObject(target)) {
    console.warn(`target${target}必须是一个对象`);
    return target;
  }
  return new Proxy(target, baseHandler);
}

//reactive函数
// export function reactive(obj) {
//   return new Proxy(obj, {
//     // get(target, key) {
//     //   //ToDo   收集依赖
//     //   track(target, key);
//     //   const res = Reflect.get(target, key); //返回属性的值
//     //   return res;
//     // },
//     // set(target, key, newVal) {
//     //   //返回Boolean 返回 true 代表属性设置成功。 在严格模式下，如果 set() 方法返回 false，那么会抛出一个 TypeError 异常。
//     //   const res = Reflect.set(target, key, newVal); //返回一个 Boolean 值表明是否成功设置属性。
//     //   //ToDo   触发依赖依赖
//     //   trigger(target, key);
//     //   return res;
//     // },
//     get,
//     set,
//   });
// }
export function reactive(obj) {
  return createReactiveObject(obj, mutableHandlers);
}

//readonly函数     只读不能修改
// export function readonly(obj) {
//   return new Proxy(obj, {
//     // get(target, key) {
//     //   return Reflect.get(target, key);
//     // },
//     //  set(target, key, newValue) {
//     //     console.warn(
//     //       `target:${target} 对象是readonly对象，不能修改的属性 `,
//     //       key,
//     //       newValue
//     //     );
//     //     return true;
//     //   },
//     get,
//     set,
//   });
// }

export function readonly(obj) {
  return createReactiveObject(obj, readonlyHandlers);
}

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
}

//isReactive 功能

export function isReactive(obj) {
  //如何判断是一个reactive对象 ？  或者这么问？ 什么样的对象是reactive对象
  //在设计getter的时候  传入了一个isRaedonly的参数 默认false
  // 我们可以用 obj[is_reactive]  来调用getter函数
  //  在getter函数中进行判断  如果 key ==="is_reactive"      return !isReadonly

  //reactive对象-> getter-> key===ReactiveFlags.IS_RWACTIVE  return true -> !!rrue ->true
  //非 reactive独享 ->不执行getter,对象业务ReactiveFlags.IS_RWACTIVE属性值 return undefined  -> !!undefined-> false
  return !!obj[ReactiveFlags.IS_REACTIVE];
}

//isReadonly功能

export function isReadonly(obj) {
  //同理
  return !!obj[ReactiveFlags.IS_READONLY];
}

//isProxy
export function isProxy(obj) {
  // 检查对象是否是由 reactive 或 readonly 创建的 proxy。
  //也就是说满足上面isReactive和isReadonly任意一个就是proxy   &&(与)  ||(或)
  return isReadonly(obj) === true || isReactive(obj) === true;
}

//shallowReactive
//创建一个 proxy，使其自身的 property为只读，但不执行嵌套对象的深度只读转换 (暴露原始值)
// 自身property为reactive  内部嵌套不是reactive
export function shallowReactive(obj) {
  return createReactiveObject(obj, shallowReactiveHandlers);
}

//shallowReadonly
//创建一个 proxy，使其自身的 property为只读，但不执行嵌套对象的深度只读转换 (暴露原始值)
// 自身property为readonly  内部嵌套不是readonly
export function shallowReadonly(obj) {
  return createReactiveObject(obj, shallowReadonlyHandlers);
}
