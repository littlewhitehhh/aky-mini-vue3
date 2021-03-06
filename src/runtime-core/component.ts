import { proxyRefs } from "../index";
import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmit"; //处理emit
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { initSlot } from "./componentSlots";

export function createComponentInstance(vnode, parent) {
  const component = {
    //初始化
    vnode,
    type: vnode.type,
    next: null,
    setupState: {}, //记录setup函数执行后返回的结果
    props: {},
    slots: {},
    provides: parent ? parent.provides : {},
    parent,
    emit: () => {},
    isMounted: false,
    subTree: {},
  };
  component.emit = emit.bind(null, component) as any; //绑定instance为this 并返回函数
  return component;
}

export function setupComponent(instance) {
  // TODO
  // initProps()
  console.log(instance);

  initProps(instance, instance.vnode.props);

  //initSlot()
  initSlot(instance, instance.vnode.children);

  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance: any) {
  const Component = instance.type;

  //增加了代理对象
  //cxt
  console.log({ _: 123 });

  console.log({ _: instance });

  instance.proxy = new Proxy( //增加了代理对象
    { _: instance },

    // get(target, key) {
    //   //setupState
    //   const { setupState } = instance;
    //   if (key in setupState) {
    //     return setupState[key];
    //   }
    //   //key ->$el
    //   if (key === "$el") {
    //     return instance.vnode.el;
    //   }
    // },
    PublicInstanceProxyHandlers
  );

  const { setup } = Component;

  if (setup) {
    // currentInstance = instance;
    setCurrentInstance(instance);
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    });

    setCurrentInstance(null);

    handleSetupResult(instance, setupResult);
  }
}

function handleSetupResult(instance, setupResult: any) {
  // function Object
  // TODO function
  if (typeof setupResult === "object") {
    instance.setupState = proxyRefs(setupResult); //setup返回值的ref对象 直接key访问，不用key.value
  }

  finishComponentSetup(instance);
}

function finishComponentSetup(instance: any) {
  const Component = instance.type;
  //如果用户不提供render函数   而是用的template
  if (compiler && !Component.render) {
    if (Component.template) {
      Component.render = compiler(Component.template);
    }
  }

  instance.render = Component.render;
}

//借助全局变量获取instccne

let currentInstance = null;

export function getCurrentInstance() {
  return currentInstance;
}

function setCurrentInstance(instance) {
  currentInstance = instance;
}

let compiler;

export function registerRuntimeCompiler(_compiler) {
  compiler = _compiler;
}
