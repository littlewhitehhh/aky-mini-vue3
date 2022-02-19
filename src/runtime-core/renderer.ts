import { effect } from "../reactivity/effect";
import { EMPTY_OBJ, isObject } from "../shared/index";
import { shapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options;

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

      patchElement(n1, n2, container, parentComponent);
    }
  }

  //挂载element
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

  //更新element
  function patchElement(n1, n2, container, parentComponent) {
    console.log("n1:", n1);
    console.log("n2:", n2);
    //type

    //props
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;
    const el = (n2.el = n1.el);

    //1、key不变 value 改变
    //2、 value= undefined 、null ==>  删除key
    //3、 老的vnode 里的key 在新的element vnode不存在了   ==> 删除
    patchProps(el, oldProps, newProps);

    // children

    patchChildren(n1, n2, el, parentComponent);
  }

  // const EMPTY_OBJ = {}
  function patchProps(el, oldProps, newProps) {
    // debugger;
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prevProp = oldProps[key];
        const nextProp = newProps[key];
        if (prevProp !== nextProp) {
          hostPatchProp(el, key, prevProp, nextProp);
        }
      }

      //第三个场景
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null);
          }
        }
      }
    }
  }

  function patchChildren(n1, n2, container, parentComponent) {
    // ArrayToText
    //判断新节点的shapeFlag  判断 children是text还是array
    const prevShapeFlag = n1.shapeFlag;
    const { shapeFlag } = n2;
    const c1 = n1.children;
    const c2 = n2.children;
    if (shapeFlag & shapeFlags.text_children) {
      //新节点children为 text类型
      if (prevShapeFlag & shapeFlags.array_children) {
        //老节点children 为array类型
        //1、把老节点清空
        unmountedChildren(n1.children);
        //2、设置text
        hostSetElementText(container, c2);
      } else {
        //老节点children为 text类型
        if (c1 !== c2) {
          //设置text
          hostSetElementText(container, c2);
        }
      }
    } else {
      //新节点children为 array类型
      if (prevShapeFlag & shapeFlags.text_children) {
        //老节点children为text
        // 1、清空老节点
        hostSetElementText(container, "");
        // 2、设置新节点
        mountChildren(n2, container, parentComponent);
      } else {
        //老节点children 为array类型
        patchKeyChildren(c1, c2);
      }
    }
  }

  function unmountedChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el;
      //remove
      hostRemove(el);
    }
  }

  function patchKeyChildren(c1, c2) {
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = c2.length - 2;

    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];

      // if(isSoneVnodeType(n1,n2)){

      //   pa
      // }
    }
  }
  //componentvnode.type为component类型
  function processComponent(n1, n2: any, container: any, parentComponent) {
    mountComponent(n1, n2, container, parentComponent);
  }

  //组件初始化
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
