export const extend = Object.assign;

export function isObject(val) {
  return val !== null && typeof val === "object";
}

export const hasOwn = (val, key) =>
  Object.prototype.hasOwnProperty.call(val, key);
