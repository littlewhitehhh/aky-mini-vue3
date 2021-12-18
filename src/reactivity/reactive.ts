import { track, trigger } from "./effect";


export function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {
      //ToDo   收集依赖
      track(target, key);
      return Reflect.get(target, key);
    },
    set(target, key, newVal) {
      const res = Reflect.set(target, key, newVal);
      //ToDo   触发依赖依赖
      trigger(target,key)
      return res;
    },
  });
}
