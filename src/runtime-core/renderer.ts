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
    patch(null, vnode, container, null, null);
  }

  /**
   *
   * @param n1  老的vnode    n1存在  更新逻辑   n1不存在 初始化逻辑
   * @param n2 新的vnode
   * @param container  容器
   * @param parentComponent 父组件
   */

  function patch(n1, n2, container, parentComponent, anchor) {
    //TODO  判断vnode是不是一个element
    //是element 就应该处理element
    //如何去区分是element类型和component类型      ：vnode.type 来判断
    // console.log(vnode.type);

    // const { type, shapeFlag } = vnode;
    const { type, shapeFlag } = n2;

    //Fragment -> 只渲染children
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & shapeFlags.element) {
          // if (typeof vnode.type === "string") {
          // element类型
          processElement(n1, n2, container, parentComponent, anchor);
          // } else if (isObject(vnode.type)) {
        } else if (shapeFlag & shapeFlags.stateful_component) {
          // component类型
          processComponent(n1, n2, container, parentComponent, anchor);
        }
    }
  }

  function processFragment(n1, n2, container: any, parentComponent, anchor) {
    mountChildren(n2, container, parentComponent, anchor);
  }

  function processText(n1: any, n2: any, container: any) {
    const { children } = n2;
    const textNode = (n2.el = document.createTextNode(children));
    container.appendChild(textNode);
  }
  //element vnode.type为element类型
  function processElement(n1, n2, container, parentComponent, anchor) {
    //init 初始化
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor);
    } else {
      //TODO UPDATE
      console.log("patchElement");

      patchElement(n1, n2, container, parentComponent, anchor);
    }
  }

  //挂载element
  function mountElement(vnode: any, container: any, parentComponent, anchor) {
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
      // console.log(key);
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
      mountChildren(vnode, el, parentComponent, anchor);
    }

    //挂载要渲染的el
    // document.appendChild(el)
    // container.appendChild(el);
    // container.append(el);

    hostInsert(el, container, anchor);
  }
  function mountChildren(childrenVnode, container, parentComponent, anchor) {
    childrenVnode.children.forEach((v) => {
      patch(null, v, container, parentComponent, anchor);
    });
  }

  //更新element
  function patchElement(n1, n2, container, parentComponent, anchor) {
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

    patchChildren(n1, n2, el, parentComponent, anchor);
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

  function patchChildren(n1, n2, container, parentComponent, anchor) {
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
        mountChildren(n2, container, parentComponent, anchor);
      } else {
        //老节点children 为array类型
        patchKeyChildren(c1, c2, container, parentComponent, anchor);
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

  function patchKeyChildren(c1, c2, container, parentComponent, anchor) {
    debugger;
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = c2.length - 1;
    //1.左侧对比
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];

      if (isSameVnodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, anchor);
      } else {
        break;
      }
      i++;
    }

    //2.右侧对比
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];

      if (isSameVnodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, anchor);
      } else {
        break;
      }
      e1--;
      e2--;
    }

    //3.新的比老的多     添加到指定的位置
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        // const anchor = i + 1 < c2.length ? c2[nextPos].el : null;
        const anchor = nextPos < c2.length ? c2[nextPos].el : null;

        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      //4、新的比老的长
      while (i <= e1) {
        hostRemove(c1[i].el);
        i++;
      }
    } else {
      //中间对比
      let s1 = i;
      let s2 = i;
      let patched = 0;
      const toBePatch = e2 - s2 + 1;
      //建立新child.key的映射表
      const keyToNewIndexMap = new Map();

      //初始化映射表
      const newIndexToOldIndexMap = new Array(toBePatch);

      let moved = false;
      let maxNewIndexSoFar = 0;
      for (let i = 0; i < toBePatch; i++) {
        newIndexToOldIndexMap[i] = 0;
      }
      for (let i = s2; i <= e2; i++) {
        let nextChild = c2[i];
        keyToNewIndexMap.set(nextChild.key, i);
      }

      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i];

        if (patched >= toBePatch) {
          hostRemove(prevChild.el);
          continue;
        }

        let newIndex;
        if (prevChild.key != null) {
          //有key情况
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          //无key
          for (let j = s2; j < e2; j++) {
            if (isSameVnodeType(prevChild, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }

        if (newIndex === undefined) {
          hostRemove(prevChild.el);
        } else {
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }
          newIndexToOldIndexMap[newIndex - s2] = i + 1;

          patch(prevChild, c2[newIndex], container, parentComponent, null);
          patched++;
        }
      }

      const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : [];
      let j = increasingNewIndexSequence.length - 1;

      for (let i = toBePatch - 1; i >= 0; i--) {
        const nextIndex = i + s2;
        const nextChild = c2[nextIndex];
        const anchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null;
        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, nextChild, container, parentComponent, anchor);
        } else if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            console.log("移动位置");
            hostInsert(nextChild.el, container, anchor);
          } else {
            j--;
          }
        }
      }
    }
  }

  function isSameVnodeType(n1, n2) {
    return n1.type === n2.type && n1.key === n2.key;
  }
  //componentvnode.type为component类型
  function processComponent(n1, n2: any, container: any, parentComponent, anchor) {
    if (!n1) {
      mountComponent(n1, n2, container, parentComponent, anchor);
    } else {
      updateComponent(n1, n2);
    }
  }

  //组件初始化
  function mountComponent(n1, initialVNode: any, container, parentComponent, anchor) {
    const instance = (initialVNode.component = createComponentInstance(initialVNode, parentComponent));

    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container, anchor);
  }

  function setupRenderEffect(instance: any, initialVNode, container, anchor) {
    //响应式
    instance.update = effect(() => {
      // 区分式初始化还是更新
      if (!instance.isMounted) {
        //init
        console.log("init");
        const { proxy } = instance;
        const subTree = (instance.subTree = instance.render.call(proxy)); //subTree 虚拟节点树  vnode树
        console.log(subTree);

        patch(null, subTree, container, instance, anchor);

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

        patch(preSubTree, subTree, container, instance, anchor);
      }
    });
  }

  function updateComponent(n1, n2) {
    //获取到挂载到vnode上的component
    const instance = (n2.component = n1.component);
    instance.update();
  }

  return {
    createApp: createAppAPI(render),
  };
}

//最长递增子序列
function getSequence(arr) {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}
