import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { initSlot } from "./componentSlots";

export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {}, //记录setup函数执行后返回的结果
    props: {},
    slots: {},
    emit: () => {},
  };
  component.emit = emit.bind(null, component) as any;
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
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    });

    handleSetupResult(instance, setupResult);
  }
}

function handleSetupResult(instance, setupResult: any) {
  // function Object
  // TODO function
  if (typeof setupResult === "object") {
    instance.setupState = setupResult;
  }

  finishComponentSetup(instance);
}

function finishComponentSetup(instance: any) {
  const Component = instance.type;

  if (Component.render) {
    instance.render = Component.render;
  }
}
