export const enum shapeFlags {
  element = 1, //0001
  stateful_component = 1 << 1, // << 左移1位  0010
  text_children = 1 << 2, // 左移2位  0100
  array_children = 1 << 3, //左移3位 1000
}
