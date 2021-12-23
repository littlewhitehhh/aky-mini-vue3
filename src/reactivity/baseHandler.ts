// reactive和readonly对象复用代码的重构

import { isObject } from "../shared";
import { track, trigger } from "./effect";
import { reactive, ReactiveFlags, readonly } from "./reactive";

function createGetter(isReadonly = false, isShallowReadonly = false) {
  return function get(target, key) {
    //专门判断isReactive
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    }
    //专门判断isReadonly
    if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly;
    }

    const res = Reflect.get(target, key);

    //如果是shallowReadonly类型，就不用执行内部嵌套的响应式转换。也不用执行依赖收集

    if (isShallowReadonly) {
      return res;
    }

    //reactive、readonly对象嵌套的响应式转换
    if (isObject(res)) {
      //递归调用
      // isReadonly == true -> 表明是readonly对象 ：是reactive对象
      return isReadonly ? readonly(res) : reactive(res);
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

const shallowReactiveGetter = createGetter(false, true);
// const shallowReactiveSetter = createSetter();

export const shallowReactiveHandlers = Object.assign(
  {},
  mutableHandlers,
  { get: shallowReactiveGetter },
  
);

const shallowReadonlyGetter = createGetter(true, true);

export const shallowReadonlyHandlers = {
  get: shallowReadonlyGetter,
  set: function (target, key, newVal) {
    console.warn(
      `key :"${String(key)}" set 失败，因为 target 是 readonly 类型`,
      target,
      newVal
    );
    return true;
  },
};