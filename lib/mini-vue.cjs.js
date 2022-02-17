'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

//effect 第一个参数接受一个函数
//ReactiveEffect类 （抽离的一个概念）  ------>面向对象思维
/**
 * 不给activeEffect添加类型， 单测会报错
 * 所以进行了代码优化
 */
// let activeEffect: () => void;
// export function effect(fn: () => void) {
//   activeEffect = fn;
//   fn(); //执行函数 ->触发了响应式对象的getter ->track
//   activeEffect = function () {};
// }
//工具函数
function cleanupEffect(effect) {
    effect.deps.forEach(function (dep) {
        dep.delete(effect);
    });
    //把 effect.deps清空
    effect.deps.length = 0;
}
//代码优化  面向对象思想
var activeEffect;
var shouldTrack = false; //用于记录是否应该收集依赖，防止调用stop后触发响应式对象的property的get的依赖收集   obj.foo ++
var ReactiveEffect = /** @class */ (function () {
    function ReactiveEffect(fn, option) {
        this.deps = []; //用于保存与当前实例相关的响应式对象的 property 对应的 Set 实例
        this.active = true; //用于记录当前实例状态，为 true 时未调用 stop 方法，否则已调用，防止重复调用 stop 方法
        this._fn = fn;
        this.scheduler = option === null || option === void 0 ? void 0 : option.scheduler;
        this.onStop = option === null || option === void 0 ? void 0 : option.onStop;
        // this.deps = [];
        // this.active = true;
    }
    //用于执行传入的函数
    ReactiveEffect.prototype.run = function () {
        if (!this.active) {
            return this._fn();
        }
        //应该收集依赖
        shouldTrack = true;
        activeEffect = this;
        var res = this._fn();
        //重置
        shouldTrack = false;
        // 返回传入的函数执行的结果
        return res;
    };
    ReactiveEffect.prototype.stop = function () {
        //删除effect
        if (this.active) {
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    };
    return ReactiveEffect;
}());
//effect函数
/**
 * param fn 参数函数
 */
function effect(fn, option) {
    if (option === void 0) { option = {}; }
    var _effect = new ReactiveEffect(fn, option);
    Object.assign(_effect, option);
    _effect.run(); //实际上是调用执行了fn函数
    var runner = _effect.run.bind(_effect); //直接调用runnner
    runner.effect = _effect;
    return runner;
}
var targetMap = new WeakMap();
// 进行依赖收集track
function track(target, key) {
    // 若不应该收集依赖则直接返回
    // if (!shouldTrack || activeEffect === undefined) {
    //   return;
    // }
    if (!isTracking())
        return;
    //1、先获取到key的依赖集合dep
    //所有对象的的以来集合targetMap -> 当前对象的依赖集合objMap -> 当前key的依赖集合
    var objMap = targetMap.get(target);
    // 如果没有初始化过  需要先初始化
    if (!objMap) {
        objMap = new Map();
        targetMap.set(target, objMap);
    }
    //同理 如果没有初始化过  需要先初始化
    var dep = objMap.get(key);
    if (!dep) {
        dep = new Set(); //依赖不会重复
        objMap.set(key, dep);
    }
    //d将依赖函数添加给dep
    // if (!activeEffect) return;
    // if(dep.has(activeEffect)) return
    // dep.add(activeEffect); ? 怎么获取到fn?  添加一个全局变量activeEffect
    // activeEffect?.deps.push(dep); ?
    trackEffect(dep);
}
//重构
function trackEffect(dep) {
    //看看dep之前有没有添加过，添加过的话 就不添加了
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}
//activeEffect可能为undefined 原因： 访问一个单纯的reactive对象，没有任何依赖的时候 activeEffect可能为undefined
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}
console.log(targetMap.has(effect));
//触发依赖trigger
function trigger(target, key) {
    // console.log("触发依赖了");
    //1、先获取到key的依赖集合dep
    var objMap = targetMap.get(target);
    // console.log(objMap);
    var dep = objMap.get(key);
    console.log(objMap);
    //去执行dep里面的函数
    // dep.forEach((effect) => {
    //   if (effect.scheduler) {
    //     effect.scheduler();
    //   } else {
    //     effect.run();
    //   }
    // });
    triggerEffect(dep);
}
// 重构
function triggerEffect(dep) {
    dep.forEach(function (effect) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    });
}

function isObject(val) {
    return val !== null && typeof val === "object";
}
var hasOwn = function (val, key) {
    return Object.prototype.hasOwnProperty.call(val, key);
};
//add-foo ->addFoo
var camelize = function (str) {
    return str.replace(/-(\w)/g, function (_, c) {
        return c ? c.toUpperCase() : "";
    });
};
//addFoo ->AddFoo
var capitalize = function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
// console.log(capitalize(event));
// AddFoo -> toAddFoo
var toHandlerKey = function (str) {
    return str ? "on" + str : "";
};

// reactive和readonly对象复用代码的重构
function createGetter(isReadonly, isShallow) {
    if (isReadonly === void 0) { isReadonly = false; }
    if (isShallow === void 0) { isShallow = false; }
    //true
    return function get(target, key) {
        //专门判断isReactive
        if (key === "__v_isReactive" /* IS_REACTIVE */) {
            return !isReadonly;
        }
        //专门判断isReadonly
        else if (key === "__v_isReadonly" /* IS_READONLY */) {
            return isReadonly;
        }
        var res = Reflect.get(target, key);
        //如果是shallowReadonly类型，就不用执行内部嵌套的响应式转换。也不用执行依赖收集
        if (isShallow) {
            return res;
        }
        //reactive、readonly对象嵌套的响应式转换
        if (isObject(res)) {
            //递归调用
            // isReadonly == true -> 表明是readonly对象 ：是reactive对象
            return isReadonly ? readonly(res) : reactive(res);
        }
        //reactive对象的getter 进行依赖收集   //readonly对象不用进行依赖收集
        if (!isReadonly) {
            track(target, key);
        }
        return Reflect.get(target, key);
    };
}
function createSetter() {
    //只有reactive对象能够调用setter
    return function set(target, key, newVal) {
        var res = Reflect.set(target, key, newVal);
        //触发依赖
        trigger(target, key);
        return res;
    };
}
// reactive对象getter和setter
var get = createGetter();
var set = createSetter();
var mutableHandlers = {
    get: get,
    set: set,
};
// readonly对象的getter和setter
var readonlyGetter = createGetter(true);
var readonlyHandlers = {
    get: readonlyGetter,
    set: function (target, key, newVal) {
        console.warn("key :\"".concat(String(key), "\" set \u5931\u8D25\uFF0C\u56E0\u4E3A target \u662F readonly \u7C7B\u578B"), target, newVal);
        return true;
    },
};
createGetter(false, true);
var shallowReadonlyGetter = createGetter(true, true);
var shallowReadonlyHandlers = {
    get: shallowReadonlyGetter,
    set: function (target, key, newVal) {
        console.warn("key :\"".concat(String(key), "\" set \u5931\u8D25\uFF0C\u56E0\u4E3A target \u662F readonly \u7C7B\u578B"), target, newVal);
        return true;
    },
};

// import { track, trigger } from "./effect";
// import { track, trigger } from "./effect";
/**
 * reative 和 readonly 的get和set重复代码较多，进行代码抽取重构
 *
 */
// 工具函数
function createReactiveObject(target, baseHandler) {
    if (!isObject(target)) {
        console.warn("target".concat(target, "\u5FC5\u987B\u662F\u4E00\u4E2A\u5BF9\u8C61"));
        return target;
    }
    return new Proxy(target, baseHandler);
}
//reactive函数
// export function reactive(obj) {
//   return new Proxy(obj, {
//     // get(target, key) {
//     //   //ToDo   收集依赖
//     //   track(target, key);
//     //   const res = Reflect.get(target, key); //返回属性的值
//     //   return res;
//     // },
//     // set(target, key, newVal) {
//     //   //返回Boolean 返回 true 代表属性设置成功。 在严格模式下，如果 set() 方法返回 false，那么会抛出一个 TypeError 异常。
//     //   const res = Reflect.set(target, key, newVal); //返回一个 Boolean 值表明是否成功设置属性。
//     //   //ToDo   触发依赖依赖
//     //   trigger(target, key);
//     //   return res;
//     // },
//     get,
//     set,
//   });
// }
function reactive(obj) {
    return createReactiveObject(obj, mutableHandlers);
}
//readonly函数     只读不能修改
// export function readonly(obj) {
//   return new Proxy(obj, {
//     // get(target, key) {
//     //   return Reflect.get(target, key);
//     // },
//     //  set(target, key, newValue) {
//     //     console.warn(
//     //       `target:${target} 对象是readonly对象，不能修改的属性 `,
//     //       key,
//     //       newValue
//     //     );
//     //     return true;
//     //   },
//     get,
//     set,
//   });
// }
function readonly(obj) {
    return createReactiveObject(obj, readonlyHandlers);
}
//shallowReadonly
//创建一个 proxy，使其自身的 property为只读，但不执行嵌套对象的深度只读转换 (暴露原始值)
// 自身property为readonly  内部嵌套不是readonly
function shallowReadonly(obj) {
    return createReactiveObject(obj, shallowReadonlyHandlers);
}

function emit(instance, event) {
    // console.log("emit" + event);
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    //  instance.props  有没有对应event的回调
    var props = instance.props;
    //tpp  ->
    //先去写一个特定行为 -》 重构通用行为
    // const handler = props["onAdd"];
    //add-foo ->addFoo
    // const camelize = (str: string) => {
    //   return str.replace(/-(\w)/g, (_, c: string) => {
    //     return c ? c.toUpperCase() : "";
    //   });
    // };
    // //addFoo ->AddFoo
    // const capitalize = (str: string) => {
    //   return str.charAt(0).toUpperCase() + str.slice(1);
    // };
    // console.log(capitalize(event));
    // const str = capitalize(camelize(event));
    // AddFoo -> toAddFoo
    // const toHandlerKey = (str: string) => {
    //   return str ? "on" + str : "";
    // };
    //add-foo -> addFoo
    var str = camelize(event);
    //addFoo -> AddFoo
    str = capitalize(str);
    var handlerName = toHandlerKey(str);
    var handler = props[handlerName];
    handler && handler.apply(void 0, args);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

var PublicPropertiesMap = {
    $el: function (i) { return i.vnode.el; },
    $slots: function (i) { return i.slots; },
};
var PublicInstanceProxyHandlers = {
    get: function (_a, key) {
        var instance = _a._;
        //setupState
        var setupState = instance.setupState, props = instance.props;
        if (key in setupState) {
            return setupState[key];
        }
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        //key ->$el
        var publicGetter = PublicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};

function initSlot(instance, children) {
    // instance.slots = Array.isArray(children) ? children : [children];
    //children  Object
    // const slots = {};
    // for (const key in children) {
    //   const value = children[key];
    //   slots[key] = normalizeSlotsValue(value);
    // }
    // instance.slots = slots
    var vnode = instance.vnode;
    if (vnode.shapeFlag & 16 /* slot_children */) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    var _loop_1 = function (key) {
        var value = children[key];
        slots[key] = function (props) { return normalizeSlotsValue(value(props)); };
    };
    for (var key in children) {
        _loop_1(key);
    }
}
function normalizeSlotsValue(value) {
    return Array.isArray(value) ? value : [value];
}

function createComponentInstance(vnode, parent) {
    var component = {
        vnode: vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        provides: parent ? parent.provides : {},
        parent: parent,
        emit: function () { },
        isMounted: false,
        subTree: {},
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    // TODO
    // initProps()
    console.log(instance);
    initProps(instance, instance.vnode.props);
    //initSlot()
    initSlot(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    var Component = instance.type;
    //增加了代理对象
    //cxt
    console.log({ _: instance });
    instance.proxy = new Proxy(//增加了代理对象
    { _: instance }, 
    // get(target, key) {
    //   //setupState
    //   const { setupState } = instance;
    //   if (key in setupState) {
    //     return setupState[key];
    //   }
    //   //key ->$el
    //   if (key === "$el") {
    //     return instance.vnode.el;
    //   }
    // },
    PublicInstanceProxyHandlers);
    var setup = Component.setup;
    if (setup) {
        // currentInstance = instance;
        setCurrentInstance(instance);
        var setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // function Object
    // TODO function
    if (typeof setupResult === "object") {
        instance.setupState = proxyRefs(setupResult); //setup返回值的ref对象 直接key访问，不用key.value
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    var Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}
//借助全局变量获取instccne
var currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

var Fragment = Symbol("Fragment");
var Text = Symbol("Text");
function createVNode(type, props, children) {
    var vnode = {
        type: type,
        props: props,
        children: children,
        shapeFlag: getShapeFlag(type),
        el: null, //$el用的
    };
    //children
    if (typeof children === "string") {
        vnode.shapeFlag = vnode.shapeFlag | 4 /* text_children */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag = vnode.shapeFlag | 8 /* array_children */;
    }
    // 组件 + children 为object类型
    if (vnode.shapeFlag & 2 /* stateful_component */) {
        if (isObject(children)) {
            vnode.shapeFlag = vnode.shapeFlag | 16 /* slot_children */;
        }
    }
    return vnode;
}
function createTextVnode(text) {
    return createVNode(Text, {}, text);
}
function getShapeFlag(type) {
    return typeof type === "string" ? 1 /* element */ : 2 /* stateful_component */;
}

function render(vnode, container) {
    // debugger;
    patch(null, vnode, container, null);
}
/**
 *
 * @param n1  老的vnode    n1存在  更新逻辑   n1不存在 初始化逻辑
 * @param n2 新的vnode
 * @param container  容器
 * @param parentComponent 父组件
 *
 *
 *
 */
function patch(n1, n2, container, parentComponent) {
    //TODO  判断vnode是不是一个element
    //是element 就应该处理element
    //如何去区分是element类型和component类型      ：vnode.type 来判断
    // console.log(vnode.type);
    // const { type, shapeFlag } = vnode;
    var type = n2.type, shapeFlag = n2.shapeFlag;
    //Fragment -> 只渲染children
    switch (type) {
        case Fragment:
            processFragment(n1, n2, container, parentComponent);
            break;
        case Text:
            processText(n1, n2, container);
            break;
        default:
            if (shapeFlag & 1 /* element */) {
                // if (typeof vnode.type === "string") {
                // element类型
                processElement(n1, n2, container, parentComponent);
                // } else if (isObject(vnode.type)) {
            }
            else if (shapeFlag & 2 /* stateful_component */) {
                // component类型
                processComponent(n1, n2, container, parentComponent);
            }
    }
}
function processFragment(n1, n2, container, parentComponent) {
    mountChildren(n2, container, parentComponent);
}
function processText(n1, n2, container) {
    var children = n2.children;
    var textNode = (n2.el = document.createTextNode(children));
    container.appendChild(textNode);
}
//element vnode.type为element类型
function processElement(n1, n2, container, parentComponent) {
    //init 初始化
    if (!n1) {
        mountElement(n1, n2, container, parentComponent);
    }
    else {
        //TODO UPDATE
        console.log("patchElement");
        patchElement(n1, n2);
    }
}
function mountElement(n1, n2, container, parentComponent) {
    // const el = document.createElement("div")
    var el = (n2.el = document.createElement(n2.type));
    // el.setttribute("id", "root");
    var props = n2.props;
    for (var key in props) {
        var val = props[key];
        console.log(key);
        // const isOn = (key) => /^on[A-Z]/.test(key);
        // if(isOn(key)){
        if (key.startsWith("on")) {
            // console.log(key.split("on")[1]);
            var event_1 = key.slice(2).toLowerCase();
            el.addEventListener(event_1, val);
        }
        else {
            el.setAttribute(key, val);
        }
    }
    // el.textContent = "hi mini-vue";
    var children = n2.children, shapeFlag = n2.shapeFlag;
    if (shapeFlag & 4 /* text_children */) {
        // if (typeof children === "string") {
        //children为srting类型
        el.textContent = children;
        // } else if (Array.isArray(children)) {
    }
    else if (shapeFlag & 8 /* array_children */) {
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
    childrenVnode.forEach(function (v) {
        patch(null, v, container, parentComponent);
    });
}
function patchElement(n1, n2, container) {
    console.log("n1:", n1);
    console.log("n2:", n2);
    //type
    //props
    // children
}
//componentvnode.type为component类型
function processComponent(n1, n2, container, parentComponent) {
    mountComponent(n1, n2, container, parentComponent);
}
function mountComponent(n1, initialVNode, container, parentComponent) {
    var instance = createComponentInstance(initialVNode, parentComponent);
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
}
function setupRenderEffect(instance, initialVNode, container) {
    //响应式
    effect(function () {
        // 区分式初始化还是更新
        if (!instance.isMounted) {
            //init
            console.log("init");
            var proxy = instance.proxy;
            var subTree = (instance.subTree = instance.render.call(proxy)); //subTree 虚拟节点树  vnode树
            console.log(subTree);
            patch(null, subTree, container, instance);
            //element ->mount
            initialVNode.el = subTree.el;
            instance.isMounted = true;
        }
        else {
            //update
            console.log("update");
            var proxy = instance.proxy;
            var subTree = instance.render.call(proxy); //subTree 虚拟节点树  vnode树
            console.log(subTree);
            var preSubTree = instance.subTree;
            console.log(preSubTree);
            console.log(subTree);
            instance.subTree = subTree;
            patch(preSubTree, subTree, container, instance);
        }
    });
}

function createApp(rootComponent) {
    return {
        mount: function (rootContainer) {
            var vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        },
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    var slot = slots[name];
    if (slot) {
        if (typeof slot === "function") {
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

function provide(key, value) {
    //存
    //key value 存在哪里？？？？    存在当前实例对象上
    //获取当前组件实例对象
    var currentInstance = getCurrentInstance();
    if (currentInstance) {
        var provides = currentInstance.provides;
        var parentProvides = currentInstance.parent.provides;
        //init    不能每次都初始化，只有第一次初始化
        //判断初始化状态     当前组件的provides = parentProvides
        if (provides === parentProvides) {
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
function inject(key, defaultValue) {
    //取
    var currentInstance = getCurrentInstance();
    if (currentInstance) {
        var parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === "function") {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

// export function ref(val) {
// ref接口的实现类  对操作进行封装
var RefImpl = /** @class */ (function () {
    function RefImpl(value) {
        this.__v_isRef = true; // 判断是ref的标识
        // 将传入的值赋值给实例的私有属性property_value
        this._rawValue = value;
        //value 为对象的话    需要转换为reactive包裹value
        this._value = isObject(value) ? reactive(value) : value;
        this.dep = new Set();
    }
    Object.defineProperty(RefImpl.prototype, "value", {
        get: function () {
            if (isTracking()) {
                // 进行依赖收集
                trackEffect(this.dep);
            }
            return this._value;
        },
        set: function (val) {
            //如果value是reactive对象的时候  this._value 为Proxy
            // 提前声明一个this._rawValue 来存储并进行比较
            if (Object.is(val, this._rawValue))
                return; //  ref.value = 2   ref.value = 2   两次赋值相同值的操作  不会执行effect
            this._rawValue = val;
            // this._value = isObject(val) ? reactive(val) : val;
            this._value = convert(val); //处理值  如果是对象 ->转为reactive对象  不是对象 返回原值
            triggerEffect(this.dep);
        },
        enumerable: false,
        configurable: true
    });
    return RefImpl;
}());
function convert(val) {
    return isObject(val) ? reactive(val) : val;
}
//ref
function ref(val) {
    return new RefImpl(val);
}
//isRef
function isRef(val) {
    return !!(val.__v_isRef === true);
}
//unRef
function unRef(val) {
    return isRef(val) ? val.value : val;
}
//proxyRef     应用场景： template中使用setup中return的ref  不需要使用ref.value
function proxyRefs(objectWithRefs) {
    //怎么知道调用getter 和setter ？  ->proxy
    return new Proxy(objectWithRefs, {
        get: function (target, key) {
            //get -> age(ref)  那么就给他返回 .value
            // not ref    -> return value
            return unRef(Reflect.get(target, key));
        },
        set: function (target, key, newVal) {
            //当前需要修改的值是ref对象，同时修改值不是ref
            if (isRef(target[key]) && !isRef(newVal)) {
                target[key].value = newVal;
                return true;
            }
            else {
                return Reflect.set(target, key, newVal);
            }
        },
    });
}

function add(a, b) {
    return a + b;
}

exports.add = add;
exports.createApp = createApp;
exports.createTextVnode = createTextVnode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.ref = ref;
exports.renderSlots = renderSlots;
