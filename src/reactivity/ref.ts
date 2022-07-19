// export function ref(val) {
//   const refObj = {
//     value: val,
//   };
//   return refObj;
// }

import { isObject } from "../shared/index";
import { isTracking, trackEffect, triggerEffect } from "./effect";
import { reactive } from "./reactive";

// ref接口的实现类  对操作进行封装
class RefImpl {
  private _value: any;
  public dep;
  private _rawValue: any;
  public __v_isRef = true; // 判断是ref的标识
  constructor(value) {
    // 将传入的值赋值给实例的私有属性property_value
    this._rawValue = value;
    //value 为对象的话    需要转换为reactive包裹value
    // this._value = isObject(value) ? reactive(value) : value;
    this._value = convert(value);
    this.dep = new Set();
  }
  get value() {
    if (isTracking()) {
      // 进行依赖收集
      trackEffect(this.dep);
    }

    return this._value;
  }
  set value(val) {
    //如果value是reactive对象的时候  this._value 为Proxy
    // 提前声明一个this._rawValue 来存储并进行比较
    if (Object.is(val, this._rawValue)) return; //  ref.value = 2   ref.value = 2   两次赋值相同值的操作  不会执行effect
    this._rawValue = val;
    // this._value = isObject(val) ? reactive(val) : val;
    this._value = convert(val); //处理值  如果是对象 ->转为reactive对象  不是对象 返回原值
    triggerEffect(this.dep);
  }
}
function convert(val) {
  return isObject(val) ? reactive(val) : val;
}

//ref
export function ref(val) {
  return new RefImpl(val);
}

//isRef
export function isRef(val) {
  return !!(val.__v_isRef === true);
}

//unRef
export function unRef(val) {
  return isRef(val) ? val.value : val;
}

//proxyRef     应用场景： template中使用setup中return的ref  不需要使用ref.value

export function proxyRefs(objectWithRefs) {
  //怎么知道调用getter 和setter ？  ->proxy
  return new Proxy(objectWithRefs, {
    get(target, key) {
      //get -> age(ref)  那么就给他返回 .value
      // not ref    -> return value
      return unRef(Reflect.get(target, key));
    },
    set(target, key, newVal) {
      //当前需要修改的值是ref对象，同时修改值不是ref
      if (isRef(target[key]) && !isRef(newVal)) {
        target[key].value = newVal;
        return true;
      } else {
        return Reflect.set(target, key, newVal);
      }
    },
  });
}
