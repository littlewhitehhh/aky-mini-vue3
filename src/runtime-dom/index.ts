import { createRenderer } from "../runtime-core/index";

function createElement(type) {
  return document.createElement(type);
}

function patchProp(el, key, val) {
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

function insert(el, parent) {
  parent.append(el);
}

const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert,
});

export function createApp(...args) {
  return renderer.createApp(...args);
}

export * from "../runtime-core/index";
