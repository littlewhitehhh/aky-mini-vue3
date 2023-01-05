import { getCurrentInstance } from "./component";

export function provide(key, value) {
  //存
  //key value 存在哪里？？？？    存在当前实例对象上

  //获取当前组件实例对象
  const currentInstance: any = getCurrentInstance();

  if (currentInstance) {
    let { provides } = currentInstance;
    const parentProvides = currentInstance.parent.provides;

    //init    不能每次都初始化，只有第一次初始化
    //判断初始化状态     当前组件的provides = parentProvides
    if (provides === parentProvides) {
      provides = currentInstance.provides = Object.create(parentProvides); //利用原型原型链的机制 来进行多层inject provides
    }

    provides[key] = value;
  }
}

export function inject(key, defaultValue) {
  //取

  const currentInstance: any = getCurrentInstance();
  if (currentInstance) {
    const parentProvides = currentInstance.parent.provides;

    if (key in parentProvides) {
      return parentProvides[key];
    } else if (defaultValue) {
      if (typeof defaultValue === "function") {
        return defaultValue();
      }
      return defaultValue;
    }
  }
}

/**
 *
 *  思路： provide提供数据    inject获取数据
 *
 *
 * 1、基础作用  父子间的provide和inject
 * provide(key,value)
 * provide在setup中使用， 我们通过getCurrentInstance 获取到当前组件实例，并将传入的参数通过key-value的形式保存到instance.provide上
 *
 *
 * inject(key)
 *
 * 在setup中使用， 通过getCurrentInstance 获取到组件实例，，通过instance.parent.provide来获取父组件的provide
 * 通过key 老获取到所需要的值
 *
 *
 * 2、跨层级的provide和inject
 *
 * 前面的实现只支持 父子间的provide和inject传递，更深层次的传递利用了原型和原型链的机制
 *
 * 父组件  parentProvide
 * 子组件  provide
 * 孙组件  inject
 *
 * provide currentInstance.provide =  Object.create(parentProvide)
 *
 * 在孙组件中 使用inject(key)   查找key的value
 * 先找子组件提供的provide,找到就直接返回value，
 * 找不到就会通过原型链查找parentProvide上的key值，逐级向上直到找到值
 *
 * 3、init provide
 *
 * 在创建instance实例的时候， 我们设置 parent和 provide 的默认值、
 * parent = parentInstance
 * provide =  parent ？ parent.provide :{}
 * 所以  provide中我们获取的provide 和 parentProvide 在最初是一致的
 *
 * 在进行object.create()后 provide会变成一个空对象，其prototype 指向 parentProvide
 *
 * 然后在空对象上进行新值的添加，我们不能每次进行provide都进行一次object.create 这样，我们在同一个setup中 之前的多次的provide只会生效最后一次
 *
 * 所以我们只需要进行一次原型链的继承
 *
 * 而这一次就要在最初的时候进行， 就是provide = parentProvide
 */
