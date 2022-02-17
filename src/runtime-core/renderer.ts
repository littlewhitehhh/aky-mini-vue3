import { effect } from "../reactivity/effect";
import { isObject } from "../shared/index";
import { shapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {
  const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options;

  function render(vnode, container) {
    // debugger;
    patch(null, vnode, container, null);
  }

  /**
   *
   * @param n1  老的vnode    n1存在  更新逻辑   n1不存在 初始化逻辑
   * @param n2 新的vnode
   * @param container  容器
   * @param parentComponent 父组件
   */

  function patch(n1, n2, container, parentComponent) {
    //TODO  判断vnode是不是一个element
    //是element 就应该处理element
    //如何去区分是element类型和component类型      ：vnode.type 来判断
    // console.log(vnode.type);

    // const { type, shapeFlag } = vnode;
    const { type, shapeFlag } = n2;

    //Fragment -> 只渲染children
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & shapeFlags.element) {
          // if (typeof vnode.type === "string") {
          // element类型
          processElement(n1, n2, container, parentComponent);
          // } else if (isObject(vnode.type)) {
        } else if (shapeFlag & shapeFlags.stateful_component) {
          // component类型
          processComponent(n1, n2, container, parentComponent);
        }
    }
  }

  function processFragment(n1, n2, container: any, parentComponent) {
    mountChildren(n2, container, parentComponent);
  }

  function processText(n1: any, n2: any, container: any) {
    const { children } = n2;
    const textNode = (n2.el = document.createTextNode(children));
    container.appendChild(textNode);
  }
  //element vnode.type为element类型
  function processElement(n1, n2, container, parentComponent) {
    //init 初始化
    if (!n1) {
      mountElement(n2, container, parentComponent);
    } else {
      //TODO UPDATE
      console.log("patchElement");

      patchElement(n1, n2, container);
    }
  }

  function mountElement(vnode: any, container: any, parentComponent) {
    //跨平台渲染
    //canvas
    // new Element()

    //Dom平台
    // const el = document.createElement("div")
    // const el = (n2.el = document.createElement(n2.type));
    const el = (vnode.el = hostCreateElement(vnode.type));

    //props
    // el.setttribute("id", "root");
    const { props } = vnode;
    for (const key in props) {
      const val = props[key];
      console.log(key);
      // // const isOn = (key) => /^on[A-Z]/.test(key);
      // // if(isOn(key)){
      // if (key.startsWith("on")) {
      //   // console.log(key.split("on")[1]);
      //   const event = key.slice(2).toLowerCase();
      //   el.addEventListener(event, val);
      // } else {
      //   el.setAttribute(key, val);
      // }

      hostPatchProp(el, key, null, val);
    }

    //children

    // el.textContent = "hi mini-vue";
    const { children, shapeFlag } = vnode;

    if (shapeFlag & shapeFlags.text_children) {
      // if (typeof children === "string") {
      //children为srting类型
      el.textContent = children;
      // } else if (Array.isArray(children)) {
    } else if (shapeFlag & shapeFlags.array_children) {
      //children 是数组类型
      // children.forEach((v) => {
      //   patch(v, el);
      // });
      mountChildren(vnode, el, parentComponent);
    }

    //挂载要渲染的el
    // document.appendChild(el)
    container.appendChild(el);
    // container.append(el);

    hostInsert(el, container);
  }
  function mountChildren(childrenVnode, container, parentComponent) {
    childrenVnode.children.forEach((v) => {
      patch(null, v, container, parentComponent);
    });
  }

  function patchElement(n1, n2, container) {
    console.log("n1:", n1);
    console.log("n2:", n2);
    //type
    //props
    const oldProps = n1.props || {};
    const newProps = n2.props || {};
    const el = (n2.el = n1.el);
    patchProps(el, oldProps, newProps);
    //1、key不变 value 改变
    //2、 value= undefined 、null ==>  删除key
    //3、 老的vnode 里的key 在新的element vnode不存在了   ==> 删除
    // children
  }

  function patchProps(el, oldProps, newProps) {
    for (const key in newProps) {
      const prevProps = oldProps[key];
      const nextProps = newProps[key];
      if (prevProps !== nextProps) {
        hostPatchProp(el, key, prevProps, nextProps);
      }
    }

    for (const key in newProps) {
      if (!(key in newProps)) {
        hostPatchProp(el, key, oldProps[key], null);
      }
    }
  }

  //componentvnode.type为component类型
  function processComponent(n1, n2: any, container: any, parentComponent) {
    mountComponent(n1, n2, container, parentComponent);
  }

  function mountComponent(n1, initialVNode: any, container, parentComponent) {
    const instance = createComponentInstance(initialVNode, parentComponent);

    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
  }

  function setupRenderEffect(instance: any, initialVNode, container) {
    //响应式
    effect(() => {
      // 区分式初始化还是更新
      if (!instance.isMounted) {
        //init
        console.log("init");
        const { proxy } = instance;
        const subTree = (instance.subTree = instance.render.call(proxy)); //subTree 虚拟节点树  vnode树
        console.log(subTree);

        patch(null, subTree, container, instance);

        //element ->mount
        initialVNode.el = subTree.el;

        instance.isMounted = true;
      } else {
        //update
        console.log("update");
        const { proxy } = instance;
        const subTree = instance.render.call(proxy); //subTree 虚拟节点树  vnode树
        console.log(subTree);
        const preSubTree = instance.subTree;

        console.log(preSubTree);
        console.log(subTree);
        instance.subTree = subTree;

        patch(preSubTree, subTree, container, instance);
      }
    });
  }

  return {
    createApp: createAppAPI(render),
  };
}
