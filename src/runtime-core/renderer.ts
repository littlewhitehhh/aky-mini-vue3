import { isObject } from "../shared/index";
import { shapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  patch(vnode, container);
}

function patch(vnode, container) {
  //TODO  判断vnode是不是一个element
  //是element 就应该处理element
  //如何去区分是element类型和component类型      ：vnode.type 来判断
  // console.log(vnode.type);

  const { shapeFlag } = vnode;

  if (shapeFlag & shapeFlags.element) {
    // if (typeof vnode.type === "string") {
    // element类型
    processElement(vnode, container);
    // } else if (isObject(vnode.type)) {
  } else if (shapeFlag & shapeFlags.stateful_component) {
    // component类型
    processComponent(vnode, container);
  }
}
//element vnode.type为element类型
function processElement(vnode, container) {
  //init 初始化
  //TODO UPDATE
  mountElement(vnode, container);
}

function mountElement(vnode: any, container: any) {
  // const el = document.createElement("div")
  const el = (vnode.el = document.createElement(vnode.type));

  // el.setttribute("id", "root");
  const { props } = vnode;
  for (const key in props) {
    const val = props[key];
    el.setAttribute(key, val);
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
    mountChildren(children, el);
  }
  // document.appendChild(el)
  container.appendChild(el);
  // container.append(el);
}
function mountChildren(childrenVnode, container) {
  childrenVnode.forEach((v) => {
    patch(v, container);
  });
}

//componentvnode.type为component类型

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container);
}

function mountComponent(initinalVNode: any, container) {
  const instance = createComponentInstance(initinalVNode);

  setupComponent(instance);
  setupRenderEffect(instance, initinalVNode, container);
}

function setupRenderEffect(instance: any, initinalVNode, container) {
  const { proxy } = instance;
  const subTree = instance.render.call(proxy);

  patch(subTree, container);

  //element ->mount
  initinalVNode.el = subTree.el;
}
