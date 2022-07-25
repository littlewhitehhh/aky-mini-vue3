import { createRenderer } from "../runtime-core/index";

//创建element元素
function createElement(type) {
  return document.createElement(type);
}

// function patchProp(el, key, preVal, nextVal) {
//   // const isOn = (key) => /^on[A-Z]/.test(key);
//   // if(isOn(key)){
//   if (key.startsWith("on")) {
//     // console.log(key.split("on")[1]);
//     const event = key.slice(2).toLowerCase();
//     el.addEventListener(event, nextVal);
//   } else {
//     if (nextVal === undefined || nextVal === null) {
//       el.removeAttribute(key);
//     } else {
//       el.setAttribute(key, nextVal);
//     }
//   }
// }

//创建、更新props
function patchProp(el, key, prevVal, nextVal) {
  const isOn = (key: string) => /^on[A-Z]/.test(key);
  if (isOn(key)) {
    const event = key.slice(2).toLowerCase();
    el.addEventListener(event, nextVal);
  } else {
    if (nextVal === undefined || nextVal === null) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, nextVal);
    }
  }
}

//指定位置插入
function insert(child, parent, anchor) {
  //只是添加到后面
  // parent.append(child);

  // 添加到指定位置
  parent.insertBefore(child, anchor || null);
}

//删除children
function remove(child) {
  const parent = child.parentNode;
  if (parent) {
    parent.removeChild(child);
  }
}

function setElementText(el, text) {
  el.textContent = text;
}

const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert,
  remove,
  setElementText,
});

export function createApp(...args) {
  return renderer.createApp(...args);
}

export * from "../runtime-core/index";
