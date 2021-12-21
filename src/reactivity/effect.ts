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
}

//代码优化  面向对象思想
let activeEffect: any;
let shouldTrack: boolean = false   //用于记录是否应该收集依赖，防止调用stop后触发响应式对象的property的get的依赖收集   obj.foo ++


class ReactiveEffect {
  private _fn: any;
  deps = [];  //用于保存与当前实例相关的响应式对象的 property 对应的 Set 实例
  active = true;   //用于记录当前实例状态，为 true 时未调用 stop 方法，否则已调用，防止重复调用 stop 方法
  scheduler?: () => void;
  onStop?: () => void;
  constructor(fn, option) {
    this._fn = fn;
    this.scheduler = option?.scheduler;
    this.onStop = option?.onStop
    // this.deps = [];
    // this.active = true;
  }
  //用于执行传入的函数
  run() {
    if(!this.active){
      return this._fn()
    }

    //应该收集依赖
    shouldTrack = true

    activeEffect = this;
    const res = this._fn();

    //重置
    shouldTrack = false

    // 返回传入的函数执行的结果
    return res
  }
  stop() {
    //删除effect
    if (this.active) {
      cleanupEffect(this);
      if(this.onStop){
        this.onStop()
      }
      this.active = false;
    }
  }
}

//effect函数
export function effect(fn, option: any = {}) {
  const _effect = new ReactiveEffect(fn, option);
  // Object.assign(_effect, option);

  _effect.run();

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
   if (!shouldTrack || activeEffect === undefined) {
    return
  }

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
  dep.add(activeEffect); //? 怎么获取到fn?  添加一个全局变量activeEffect
  activeEffect?.deps.push(dep); //?
}
//触发依赖trigger
export function trigger(target, key) {
  //1、先获取到key的依赖集合dep
  let objMap = targetMap.get(target);
  let dep = objMap.get(key);
  //去执行dep里面的函数
  dep.forEach((effect) => {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  });
}
