import { track, trigger } from "./effect";

export function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {
      //ToDo   收集依赖
      track(target, key);
      const res = Reflect.get(target, key);   //返回属性的值
      return res
    },
    set(target, key, newVal) {   //返回Boolean 返回 true 代表属性设置成功。 在严格模式下，如果 set() 方法返回 false，那么会抛出一个 TypeError 异常。
      const res = Reflect.set(target, key, newVal);   //返回一个 Boolean 值表明是否成功设置属性。
      //ToDo   触发依赖依赖
      trigger(target, key);
      return res;
    },
  });
}
