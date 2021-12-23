// reactive和readonly对象复用代码的重构

import { track, trigger } from "./effect";
import { ReactiveFlags } from "./reactive";

function createGetter(isReadonly = false) {
  return function get(target, key) {
    //专门判断isReactive
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    }

    //专门判断isReadonly
    if(key === ReactiveFlags.IS_READONLY){
      return isReadonly
    }

    //reactive对象的getter 进行依赖收集   //readonly对象不用进行依赖收集
    if (!isReadonly) {
      track(target, key);
    }
    return Reflect.get(target, key);
  };
}

function createSetter() {
  //只有reactive对象能够diaoyongsetter
  return function set(target, key, newVal) {
    const res = Reflect.set(target, key, newVal);

    //触发依赖
    trigger(target, key);

    return res;
  };
}

// reactive对象getter和setter
const get = createGetter();
const set = createSetter();

export const mutableHandlers = {
  get,
  set,
};

// readonly对象的getter和setter
const readonlyGetter = createGetter(true);

export const readonlyHandlers = {
  get: readonlyGetter,
  set: function (target, key, newVal) {
    console.warn(
      `key :"${String(key)}" set 失败，因为 target 是 readonly 类型`,
      target,
      newVal
    );
    return true;
  },
};
