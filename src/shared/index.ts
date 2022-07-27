export * from "./toDisplayString";

export const extend = Object.assign;

export const EMPTY_OBJ = {};

export function isObject(val) {
  return val !== null && typeof val === "object";
}

export const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);

//add-foo ->addFoo
export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c: string) => {
    return c ? c.toUpperCase() : "";
  });
};
//addFoo ->AddFoo
export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
// console.log(capitalize(event));

// AddFoo -> toAddFoo
export const toHandlerKey = (str: string) => {
  return str ? "on" + str : "";
};

export const isString = (value) => typeof value === "string";
