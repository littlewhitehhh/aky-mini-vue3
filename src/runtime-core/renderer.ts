import { isObject } from "../shared/index";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  patch(vnode, container);
}

function patch(vnode, container) {
  //TODO  判断vnode是不是一个element
  //是element 就应该处理element
  //如何去区分是element类型和component类型      ：vnode.type 来判断
  console.log(vnode.type);

  if (typeof vnode.type === "string") {
    // element类型
    processElement(vnode, container);
  } else if (isObject(vnode.type)) {
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
  const { children } = vnode;

  if (typeof children === "string") {
    //children为srting类型
    el.textContent = children;
  } else if (Array.isArray(children)) {
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

function mountComponent(vnode: any, container) {
  const instance = createComponentInstance(vnode);

  setupComponent(instance);
  setupRenderEffect(instance, vnode, container);
}

function setupRenderEffect(instance: any, vnode, container) {
  const { proxy } = instance;
  const subTree = instance.render.call(proxy);

  patch(subTree, container);

  //element ->mount
  vnode.el = subTree.el;
}
