const shapeFlags = {
  element: 0,
  statefule_component: 0,
  text_children: 0,
  array_children: 0,
};

//可以设置，修改
// vnode -> stateful_component ->
//shapeFlags.statefule_component = 1
//shapeFlags.array_children = 1,

//2. 查找
// if(shapeFlags.element)
// if(shapeFlags.statefule_component)

// 不够高效 -> 位运算的方式
// 0000;

// 0001 -> Element
// 0010 -> stateful
// 0100 -> text_children
// 1000 -> array_children

// | 或运算 两位都为0 才为0
// & 与运算 两位都为1,才为1

//修改
// 0000
// 0001
// ----
//  0000 | 0001  = 0001

//查找 &
// 0001
// 0001
// ----
// 0001
