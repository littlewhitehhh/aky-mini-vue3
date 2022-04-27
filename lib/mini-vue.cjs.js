'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const extend = Object.assign;
const EMPTY_OBJ = {};
function isObject(val) {
    return val !== null && typeof val === "object";
}
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
//add-foo ->addFoo
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : "";
    });
};
//addFoo ->AddFoo
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
// console.log(capitalize(event));
// AddFoo -> toAddFoo
const toHandlerKey = (str) => {
    return str ? "on" + str : "";
};

const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        key: props && props.key,
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

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === "function") {
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

//effect 第一个参数接受一个函数
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
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    //把 effect.deps清空
    effect.deps.length = 0;
}
//代码优化  面向对象思想
let activeEffect;
let shouldTrack = false; //用于记录是否应该收集依赖，防止调用stop后触发响应式对象的property的get的依赖收集   obj.foo ++
class ReactiveEffect {
    constructor(fn, option) {
        this.deps = []; //用于保存与当前实例相关的响应式对象的 property 对应的 Set 实例
        this.active = true; //用于记录当前实例状态，为 true 时未调用 stop 方法，否则已调用，防止重复调用 stop 方法
        this._fn = fn;
        this.scheduler = option === null || option === void 0 ? void 0 : option.scheduler;
        this.onStop = option === null || option === void 0 ? void 0 : option.onStop;
        // this.deps = [];
        // this.active = true;
    }
    //用于执行传入的函数
    run() {
        if (!this.active) {
            return this._fn();
        }
        //应该收集依赖
        shouldTrack = true;
        activeEffect = this;
        const res = this._fn();
        //重置
        shouldTrack = false;
        // 返回传入的函数执行的结果
        return res;
    }
    stop() {
        //删除effect
        if (this.active) {
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
//effect函数
/**
 * @param fn 参数函数
 */
function effect(fn, option = {}) {
    const _effect = new ReactiveEffect(fn, option);
    // Object.assign(_effect, option);
    if (option) {
        extend(_effect, option); //what this？
    }
    if (!option || !option.lazy) {
        _effect.run();
    }
    // _effect.run(); //实际上是调用执行了fn函数
    const runner = _effect.run.bind(_effect); //直接调用runnner
    runner.effect = _effect;
    return runner;
}
const targetMap = new WeakMap();
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
    let objMap = targetMap.get(target);
    // 如果没有初始化过  需要先初始化
    if (!objMap) {
        objMap = new Map();
        targetMap.set(target, objMap);
    }
    //同理 如果没有初始化过  需要先初始化
    let dep = objMap.get(key);
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
    let objMap = targetMap.get(target);
    // console.log(objMap);
    let dep = objMap.get(key);
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
    dep.forEach((effect) => {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    });
}

// reactive和readonly对象复用代码的重构
function createGetter(isReadonly = false, isShallow = false) {
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
        const res = Reflect.get(target, key);
        //reactive对象的getter 进行依赖收集   //readonly对象不用进行依赖收集
        if (!isReadonly) {
            track(target, key);
        }
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
        return res;
    };
}
function createSetter() {
    //只有reactive对象能够调用setter
    return function set(target, key, newVal) {
        const res = Reflect.set(target, key, newVal);
        //触发依赖
        trigger(target, key);
        return res;
    };
}
// reactive对象getter和setter
const get = createGetter();
const set = createSetter();
const mutableHandlers = {
    get,
    set,
};
// readonly对象的getter和setter
const readonlyGetter = createGetter(true);
const readonlyHandlers = {
    get: readonlyGetter,
    set: function (target, key, newVal) {
        console.warn(`key :"${String(key)}" set 失败，因为 target 是 readonly 类型`, target, newVal);
        return true;
    },
};
const shallowReadonlyGetter = createGetter(true, true);
const shallowReadonlyHandlers = {
    get: shallowReadonlyGetter,
    set: function (target, key, newVal) {
        console.warn(`key :"${String(key)}" set 失败，因为 target 是 readonly 类型`, target, newVal);
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
        console.warn(`target${target}必须是一个对象`);
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

function emit(instance, event, ...args) {
    // console.log("emit" + event);
    //  instance.props  有没有对应event的回调
    const { props } = instance;
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
    // AddFoo -> noAddFoo
    // const toHandlerKey = (str: string) => {
    //   return str ? "on" + str : "";
    // };
    //add-foo -> addFoo
    let str = camelize(event);
    //addFoo -> AddFoo
    str = capitalize(str);
    const handlerName = toHandlerKey(str);
    const handler = props[handlerName];
    handler && handler(...args);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

const PublicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
    $props: (i) => i.props,
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        //setupState
        const { setupState, props } = instance;
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
        const publicGetter = PublicPropertiesMap[key];
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
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* slot_children */) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        const value = children[key];
        slots[key] = (props) => normalizeSlotsValue(value(props));
    }
}
function normalizeSlotsValue(value) {
    return Array.isArray(value) ? value : [value];
}

function createComponentInstance(vnode, parent) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        provides: parent ? parent.provides : {},
        parent,
        emit: () => { },
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
    const Component = instance.type;
    //增加了代理对象
    //cxt
    console.log({ _: 123 });
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
    const { setup } = Component;
    if (setup) {
        // currentInstance = instance;
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props), {
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
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}
//借助全局变量获取instccne
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

function provide(key, value) {
    //存
    //key value 存在哪里？？？？    存在当前实例对象上
    //获取当前组件实例对象
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = currentInstance.parent.provides;
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
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
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

// import { render } from "./renderer";
function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            },
        };
    };
}
// export function createApp(rootComponent) {
//   return {
//     mount(rootContainer) {
//       const vnode = createVNode(rootComponent);
//       render(vnode, rootContainer);
//     },
//   };
// }

function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText, } = options;
    function render(vnode, container) {
        // debugger;
        patch(null, vnode, container, null, null);
    }
    /**
     *
     * @param n1  老的vnode    n1存在  更新逻辑   n1不存在 初始化逻辑
     * @param n2 新的vnode
     * @param container  容器
     * @param parentComponent 父组件
     */
    function patch(n1, n2, container, parentComponent, anchor) {
        //TODO  判断vnode是不是一个element
        //是element 就应该处理element
        //如何去区分是element类型和component类型      ：vnode.type 来判断
        // console.log(vnode.type);
        // const { type, shapeFlag } = vnode;
        const { type, shapeFlag } = n2;
        //Fragment -> 只渲染children
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent, anchor);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & 1 /* element */) {
                    // if (typeof vnode.type === "string") {
                    // element类型
                    processElement(n1, n2, container, parentComponent, anchor);
                    // } else if (isObject(vnode.type)) {
                }
                else if (shapeFlag & 2 /* stateful_component */) {
                    // component类型
                    processComponent(n1, n2, container, parentComponent, anchor);
                }
        }
    }
    function processFragment(n1, n2, container, parentComponent, anchor) {
        mountChildren(n2, container, parentComponent, anchor);
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        container.appendChild(textNode);
    }
    //element vnode.type为element类型
    function processElement(n1, n2, container, parentComponent, anchor) {
        //init 初始化
        if (!n1) {
            mountElement(n2, container, parentComponent, anchor);
        }
        else {
            //TODO UPDATE
            console.log("patchElement");
            patchElement(n1, n2, container, parentComponent, anchor);
        }
    }
    //挂载element
    function mountElement(vnode, container, parentComponent, anchor) {
        //跨平台渲染
        //canvas
        // new Element()
        //Dom平台
        // const el = document.createElement("div")
        // const el = (n2.el = document.createElement(n2.type));
        const el = (vnode.el = hostCreateElement(vnode.type));
        //props
        // el.setttribute("id", "root");
        const { props } = vnode;
        for (const key in props) {
            const val = props[key];
            // console.log(key);
            // // const isOn = (key) => /^on[A-Z]/.test(key);
            // // if(isOn(key)){
            // if (key.startsWith("on")) {
            //   // console.log(key.split("on")[1]);
            //   const event = key.slice(2).toLowerCase();
            //   el.addEventListener(event, val);
            // } else {
            //   el.setAttribute(key, val);
            // }
            hostPatchProp(el, key, null, val);
        }
        //children
        // el.textContent = "hi mini-vue";
        const { children, shapeFlag } = vnode;
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
            mountChildren(vnode, el, parentComponent, anchor);
        }
        //挂载要渲染的el
        // document.appendChild(el)
        // container.appendChild(el);
        // container.append(el);
        hostInsert(el, container, anchor);
    }
    function mountChildren(childrenVnode, container, parentComponent, anchor) {
        childrenVnode.children.forEach((v) => {
            patch(null, v, container, parentComponent, anchor);
        });
    }
    //更新element
    function patchElement(n1, n2, container, parentComponent, anchor) {
        console.log("n1:", n1);
        console.log("n2:", n2);
        //type
        //props
        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        const el = (n2.el = n1.el);
        //1、key不变 value 改变
        //2、 value= undefined 、null ==>  删除key
        //3、 老的vnode 里的key 在新的element vnode不存在了   ==> 删除
        patchProps(el, oldProps, newProps);
        // children
        patchChildren(n1, n2, el, parentComponent, anchor);
    }
    // const EMPTY_OBJ = {}
    function patchProps(el, oldProps, newProps) {
        // debugger;
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const prevProp = oldProps[key];
                const nextProp = newProps[key];
                if (prevProp !== nextProp) {
                    hostPatchProp(el, key, prevProp, nextProp);
                }
            }
            //第三个场景
            if (oldProps !== EMPTY_OBJ) {
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null);
                    }
                }
            }
        }
    }
    function patchChildren(n1, n2, container, parentComponent, anchor) {
        // ArrayToText
        //判断新节点的shapeFlag  判断 children是text还是array
        const prevShapeFlag = n1.shapeFlag;
        const { shapeFlag } = n2;
        const c1 = n1.children;
        const c2 = n2.children;
        if (shapeFlag & 4 /* text_children */) {
            //新节点children为 text类型
            if (prevShapeFlag & 8 /* array_children */) {
                //老节点children 为array类型
                //1、把老节点清空
                unmountedChildren(n1.children);
                //2、设置text
                hostSetElementText(container, c2);
            }
            else {
                //老节点children为 text类型
                if (c1 !== c2) {
                    //设置text
                    hostSetElementText(container, c2);
                }
            }
        }
        else {
            //新节点children为 array类型
            if (prevShapeFlag & 4 /* text_children */) {
                //老节点children为text
                // 1、清空老节点
                hostSetElementText(container, "");
                // 2、设置新节点
                mountChildren(n2, container, parentComponent, anchor);
            }
            else {
                //老节点children 为array类型
                patchKeyChildren(c1, c2, container, parentComponent, anchor);
            }
        }
    }
    function unmountedChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el;
            //remove
            hostRemove(el);
        }
    }
    function patchKeyChildren(c1, c2, container, parentComponent, anchor) {
        debugger;
        let i = 0;
        let e1 = c1.length - 1;
        let e2 = c2.length - 1;
        //1.左侧对比
        while (i <= e1 && i <= e2) {
            const n1 = c1[i];
            const n2 = c2[i];
            if (isSameVnodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, anchor);
            }
            else {
                break;
            }
            i++;
        }
        //2.右侧对比
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1];
            const n2 = c2[e2];
            if (isSameVnodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, anchor);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        //3.新的比老的多     添加到指定的位置
        if (i > e1) {
            if (i <= e2) {
                const nextPos = e2 + 1;
                // const anchor = i + 1 < c2.length ? c2[nextPos].el : null;
                const anchor = nextPos < c2.length ? c2[nextPos].el : null;
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor);
                    i++;
                }
            }
        }
        else if (i > e2) {
            //4、新的比老的长
            while (i <= e1) {
                hostRemove(c1[i].el);
                i++;
            }
        }
        else {
            //中间对比
            let s1 = i;
            let s2 = i;
            let patched = 0;
            const toBePatch = e2 - s2 + 1;
            //建立新child.key的映射表
            const keyToNewIndexMap = new Map();
            //初始化映射表
            const newIndexToOldIndexMap = new Array(toBePatch);
            let moved = false;
            let maxNewIndexSoFar = 0;
            for (let i = 0; i < toBePatch; i++) {
                newIndexToOldIndexMap[i] = 0;
            }
            for (let i = s2; i <= e2; i++) {
                let nextChild = c2[i];
                keyToNewIndexMap.set(nextChild.key, i);
            }
            for (let i = s1; i <= e1; i++) {
                const prevChild = c1[i];
                if (patched >= toBePatch) {
                    hostRemove(prevChild.el);
                    continue;
                }
                let newIndex;
                if (prevChild.key != null) {
                    //有key情况
                    newIndex = keyToNewIndexMap.get(prevChild.key);
                }
                else {
                    //无key
                    for (let j = s2; j < e2; j++) {
                        if (isSameVnodeType(prevChild, c2[j])) {
                            newIndex = j;
                            break;
                        }
                    }
                }
                if (newIndex === undefined) {
                    hostRemove(prevChild.el);
                }
                else {
                    if (newIndex >= maxNewIndexSoFar) {
                        maxNewIndexSoFar = newIndex;
                    }
                    else {
                        moved = true;
                    }
                    newIndexToOldIndexMap[newIndex - s2] = i + 1;
                    patch(prevChild, c2[newIndex], container, parentComponent, null);
                    patched++;
                }
            }
            const increasingNewIndexSequence = moved
                ? getSequence(newIndexToOldIndexMap)
                : [];
            let j = increasingNewIndexSequence.length - 1;
            for (let i = toBePatch - 1; i >= 0; i--) {
                const nextIndex = i + s2;
                const nextChild = c2[nextIndex];
                const anchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null;
                if (newIndexToOldIndexMap[i] === 0) {
                    patch(null, nextChild, container, parentComponent, anchor);
                }
                else if (moved) {
                    if (j < 0 || i !== increasingNewIndexSequence[j]) {
                        console.log("移动位置");
                        hostInsert(nextChild.el, container, anchor);
                    }
                    else {
                        j--;
                    }
                }
            }
        }
    }
    function isSameVnodeType(n1, n2) {
        return n1.type === n2.type && n1.key === n2.key;
    }
    //componentvnode.type为component类型
    function processComponent(n1, n2, container, parentComponent, anchor) {
        mountComponent(n1, n2, container, parentComponent, anchor);
    }
    //组件初始化
    function mountComponent(n1, initialVNode, container, parentComponent, anchor) {
        const instance = createComponentInstance(initialVNode, parentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, initialVNode, container, anchor);
    }
    function setupRenderEffect(instance, initialVNode, container, anchor) {
        //响应式
        effect(() => {
            // 区分式初始化还是更新
            if (!instance.isMounted) {
                //init
                console.log("init");
                const { proxy } = instance;
                const subTree = (instance.subTree = instance.render.call(proxy)); //subTree 虚拟节点树  vnode树
                console.log(subTree);
                patch(null, subTree, container, instance, anchor);
                //element ->mount
                initialVNode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                //update
                console.log("update");
                const { proxy } = instance;
                const subTree = instance.render.call(proxy); //subTree 虚拟节点树  vnode树
                console.log(subTree);
                const preSubTree = instance.subTree;
                console.log(preSubTree);
                console.log(subTree);
                instance.subTree = subTree;
                patch(preSubTree, subTree, container, instance, anchor);
            }
        });
    }
    return {
        createApp: createAppAPI(render),
    };
}
//最长递增子序列
function getSequence(arr) {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
                p[i] = j;
                result.push(i);
                continue;
            }
            u = 0;
            v = result.length - 1;
            while (u < v) {
                c = (u + v) >> 1;
                if (arr[result[c]] < arrI) {
                    u = c + 1;
                }
                else {
                    v = c;
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                result[u] = i;
            }
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}

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
function patchProp(el, key, prevVal, nextVal) {
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, nextVal);
    }
    else {
        if (nextVal === undefined || nextVal === null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, nextVal);
        }
    }
}
function insert(child, parent, anchor) {
    //只是添加到后面
    // parent.append(child);
    // 添加到指定位置
    parent.insertBefore(child, anchor || null);
}
function remove(child) {
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
function setElementText(el, text) {
    el.textContent = text;
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText,
});
function createApp(...args) {
    return renderer.createApp(...args);
}

// export function ref(val) {
// ref接口的实现类  对操作进行封装
class RefImpl {
    constructor(value) {
        this.__v_isRef = true; // 判断是ref的标识
        // 将传入的值赋值给实例的私有属性property_value
        this._rawValue = value;
        //value 为对象的话    需要转换为reactive包裹value
        this._value = isObject(value) ? reactive(value) : value;
        this.dep = new Set();
    }
    get value() {
        if (isTracking()) {
            // 进行依赖收集
            trackEffect(this.dep);
        }
        return this._value;
    }
    set value(val) {
        //如果value是reactive对象的时候  this._value 为Proxy
        // 提前声明一个this._rawValue 来存储并进行比较
        if (Object.is(val, this._rawValue))
            return; //  ref.value = 2   ref.value = 2   两次赋值相同值的操作  不会执行effect
        this._rawValue = val;
        // this._value = isObject(val) ? reactive(val) : val;
        this._value = convert(val); //处理值  如果是对象 ->转为reactive对象  不是对象 返回原值
        triggerEffect(this.dep);
    }
}
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
        get(target, key) {
            //get -> age(ref)  那么就给他返回 .value
            // not ref    -> return value
            return unRef(Reflect.get(target, key));
        },
        set(target, key, newVal) {
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
exports.createRenderer = createRenderer;
exports.createTextVnode = createTextVnode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.ref = ref;
exports.renderSlots = renderSlots;
