//effect 第一个参数接受一个函数
//ReactiveEffect类 （抽离的一个概念）  ------>面向对象思维

import { extend } from "../shared";

/**
 * 不给activeEffect添加类型， 单测会报错
 * 所以进行了代码优化
 */

// let activeEffect: () => void;
// export function effect(fn: () => void) {
//   activeEffect = fn;
//   fn(); //执行函数 ->触发了响应式对象的getter ->track
//   activeEffect = function () {};
// }

//工具函数
function cleanupEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect);
  });
  //把 effect.deps清空
  effect.deps.length = 0;
}

//代码优化  面向对象思想
let activeEffect: any;
let shouldTrack: boolean = false; //用于记录是否应该收集依赖，防止调用stop后触发响应式对象的property的get的依赖收集   obj.foo ++

export class ReactiveEffect {
  private _fn: any;
  deps = []; //用于保存与当前实例相关的响应式对象的 property 对应的 Set 实例   用于stop操作
  active = true; //用于记录当前实例状态，为 true 时未调用 stop 方法，否则已调用，防止重复调用 stop 方法
  scheduler?: () => void;
  onStop?: () => void;
  constructor(fn, option) {
    this._fn = fn;
    this.scheduler = option?.scheduler;
    this.onStop = option?.onStop;
    // this.deps = [];
    // this.active = true;
  }
  //用于执行传入的函数
  run() {
    //stop的状态下（active =false） 直接执行fn 不收集依赖
    if (!this.active) {
      this.active = true;
      return this._fn();
    }
    //应该收集依赖
    shouldTrack = true;

    activeEffect = this;
    const res = this._fn();

    //重置
    shouldTrack = false;
    // 返回传入的函数执行的结果
    return res;
  }
  stop() {
    //删除effect   active用于优化  多次调用stop也只清空一次
    if (this.active) {
      cleanupEffect(this);
      if (this.onStop) {
        this.onStop();
      }
      this.active = false;
    }
  }
}

//effect函数
/**
 * @param fn 参数函数
 */
export function effect(fn, option: any = {}) {
  const _effect: ReactiveEffect = new ReactiveEffect(fn, option);
  // Object.assign(_effect, option);

  if (option) {
    extend(_effect, option); //what this？
  }
  if (!option || !option.lazy) {
    _effect.run();
  }

  // _effect.run(); //实际上是调用执行了fn函数

  const runner: any = _effect.run.bind(_effect); //直接调用runnner
  runner.effect = _effect;
  return runner;
}

export function stop(runner) {
  runner.effect.stop();
}

const targetMap = new WeakMap();
// 进行依赖收集track
export function track(target, key) {
  // 若不应该收集依赖则直接返回
  // if (!shouldTrack || activeEffect === undefined) {
  //   return;
  // }
  if (!isTracking()) return;
  //1、先获取到key的依赖集合dep
  //所有对象的的以来集合targetMap -> 当前对象的依赖集合objMap -> 当前key的依赖集合
  let objMap = targetMap.get(target);
  // 如果没有初始化过  需要先初始化
  if (!objMap) {
    objMap = new Map();
    targetMap.set(target, objMap);
  }
  //同理 如果没有初始化过  需要先初始化
  let dep = objMap.get(key);
  if (!dep) {
    dep = new Set(); //依赖不会重复
    objMap.set(key, dep);
  }
  //d将依赖函数添加给dep

  // if (!activeEffect) return;
  // if(dep.has(activeEffect)) return
  // dep.add(activeEffect); ? 怎么获取到fn?  添加一个全局变量activeEffect
  // activeEffect?.deps.push(dep); ?

  trackEffect(dep);
}

//重构
export function trackEffect(dep) {
  //看看dep之前有没有添加过，添加过的话 就不添加了
  if (dep.has(activeEffect)) return;
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}

//activeEffect可能为undefined 原因： 访问一个单纯的reactive对象，没有任何依赖的时候 activeEffect可能为undefined
export function isTracking() {
  return shouldTrack && activeEffect !== undefined;
}
console.log(targetMap.has(effect));

//触发依赖trigger
export function trigger(target, key) {
  // console.log("触发依赖了");

  //1、先获取到key的依赖集合dep
  let objMap = targetMap.get(target);
  // console.log(objMap);

  let dep = objMap.get(key);
  console.log(objMap);

  //去执行dep里面的函数
  // dep.forEach((effect) => {
  //   if (effect.scheduler) {
  //     effect.scheduler();
  //   } else {
  //     effect.run();
  //   }
  // });
  triggerEffect(dep);
}

// 重构
export function triggerEffect(dep) {
  dep.forEach((effect) => {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  });
}
