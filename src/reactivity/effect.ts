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

//代码优化  面向对象思想
let activeEffect;
class ReactiveEffect {
  private _fn: any;
  constructor(fn) {
    this._fn = fn;
  }
  run() {
    activeEffect = this;
    return this._fn()
  }
}

//effect函数
export function effect(fn) {
  const _effect = new ReactiveEffect(fn);
  _effect.run();

  const runner = _effect.run.bind(_effect)  //直接调用runnner  
  return runner
}
const targetMap = new WeakMap();
// 进行依赖收集track
export function track(target, key) {
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
  dep.add(activeEffect); //? 怎么获取到fn?  添加一个全局变量activeEffect
}
//触发依赖trigger
export function trigger(target, key) {
  //1、先获取到key的依赖集合dep
  let objMap = targetMap.get(target);
  let dep = objMap.get(key);
  //去执行dep里面的函数
  dep.forEach((effect) => {
    effect.run();
  });
}


