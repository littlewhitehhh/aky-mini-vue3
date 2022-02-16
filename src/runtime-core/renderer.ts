import { isObject } from "../shared/index";
import { shapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { Fragment, Text } from "./vnode";

export function render(vnode, container) {
  // debugger;
  patch(vnode, container, null);
}

function patch(vnode, container, parentComponent) {
  //TODO  判断vnode是不是一个element
  //是element 就应该处理element
  //如何去区分是element类型和component类型      ：vnode.type 来判断
  // console.log(vnode.type);

  const { type, shapeFlag } = vnode;

  //Fragment -> 只渲染children
  switch (type) {
    case Fragment:
      processFragment(vnode, container, parentComponent);
      break;
    case Text:
      processText(vnode, container);
      break;
    default:
      if (shapeFlag & shapeFlags.element) {
        // if (typeof vnode.type === "string") {
        // element类型
        processElement(vnode, container, parentComponent);
        // } else if (isObject(vnode.type)) {
      } else if (shapeFlag & shapeFlags.stateful_component) {
        // component类型
        processComponent(vnode, container, parentComponent);
      }
  }
}

function processFragment(vnode: any, container: any, parentComponent) {
  mountChildren(vnode, container, parentComponent);
}

function processText(vnode: any, container: any) {
  const { children } = vnode;
  const textNode = (vnode.el = document.createTextNode(children));
  container.appendChild(textNode);
}
//element vnode.type为element类型
function processElement(vnode, container, parentComponent) {
  //init 初始化
  //TODO UPDATE
  mountElement(vnode, container, parentComponent);
}

function mountElement(vnode: any, container: any, parentComponent) {
  // const el = document.createElement("div")
  const el = (vnode.el = document.createElement(vnode.type));

  // el.setttribute("id", "root");
  const { props } = vnode;
  for (const key in props) {
    const val = props[key];
    console.log(key);
    // const isOn = (key) => /^on[A-Z]/.test(key);
    // if(isOn(key)){
    if (key.startsWith("on")) {
      // console.log(key.split("on")[1]);
      const event = key.slice(2).toLowerCase();
      el.addEventListener(event, val);
    } else {
      el.setAttribute(key, val);
    }
  }

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
    mountChildren(children, el, parentComponent);
  }
  // document.appendChild(el)
  container.appendChild(el);
  // container.append(el);
}
function mountChildren(childrenVnode, container, parentComponent) {
  childrenVnode.forEach((v) => {
    patch(v, container, parentComponent);
  });
}

//componentvnode.type为component类型

function processComponent(vnode: any, container: any, parentComponent) {
  mountComponent(vnode, container, parentComponent);
}

function mountComponent(initialVNode: any, container, parentComponent) {
  const instance = createComponentInstance(initialVNode, parentComponent);

  setupComponent(instance);
  setupRenderEffect(instance, initialVNode, container);
}

function setupRenderEffect(instance: any, initialVNode, container) {
  const { proxy } = instance;
  const subTree = instance.render.call(proxy);

  patch(subTree, container, instance);

  //element ->mount
  initialVNode.el = subTree.el;
}
