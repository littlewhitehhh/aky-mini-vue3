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

/**
 * 不给activeEffect添加类型， 单测会报错
 * 所以进行了代码优化
 */
var targetMap = new WeakMap();
//触发依赖trigger
function trigger(target, key) {
    // console.log("触发依赖了");
    //1、先获取到key的依赖集合dep
    var objMap = targetMap.get(target);
    // console.log(objMap);
    var dep = objMap.get(key);
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

// reactive和readonly对象复用代码的重构
function createGetter(isReadonly, isShallow) {
    if (isReadonly === void 0) { isReadonly = false; }
    if (isShallow === void 0) { isShallow = false; }
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
        return Reflect.get(target, key);
    };
}
function createSetter() {
    //只有reactive对象能够diaoyongsetter
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
var shallowReactiveGetter = createGetter(false, true);
// const shallowReactiveSetter = createSetter();
Object.assign({}, mutableHandlers, {
    get: shallowReactiveGetter,
});
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
    // //add-foo ->addFoo
    // const camelize = (str: string) => {
    //   return str.replace(/-(\w)/g, (_, c: string) => {
    //     return c ? c.toUpperCase() : "";
    //   });
    // };
    // //addFoo ->AddFoo
    // const capitalize = (str: string) => {
    //   return str.charAt(0).toUpperCase() + str.slice(1);
    // };
    // // console.log(capitalize(event));
    // const str = capitalize(camelize(event));
    // // AddFoo -> toAddFoo
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

function createComponentInstance(vnode) {
    var component = {
        vnode: vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        emit: function () { },
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    // TODO
    initProps(instance, instance.vnode.props);
    // initSlots()
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    var Component = instance.type;
    //增加了代理对象
    //cxt
    instance.proxy = new Proxy({ _: instance }, 
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
        var setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // function Object
    // TODO function
    if (typeof setupResult === "object") {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    var Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}

function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    //TODO  判断vnode是不是一个element
    //是element 就应该处理element
    //如何去区分是element类型和component类型      ：vnode.type 来判断
    // console.log(vnode.type);
    var shapeFlag = vnode.shapeFlag;
    if (shapeFlag & 1 /* element */) {
        // if (typeof vnode.type === "string") {
        // element类型
        processElement(vnode, container);
        // } else if (isObject(vnode.type)) {
    }
    else if (shapeFlag & 2 /* stateful_component */) {
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
function mountElement(vnode, container) {
    // const el = document.createElement("div")
    var el = (vnode.el = document.createElement(vnode.type));
    // el.setttribute("id", "root");
    var props = vnode.props;
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
    var children = vnode.children, shapeFlag = vnode.shapeFlag;
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
        mountChildren(children, el);
    }
    // document.appendChild(el)
    container.appendChild(el);
    // container.append(el);
}
function mountChildren(childrenVnode, container) {
    childrenVnode.forEach(function (v) {
        patch(v, container);
    });
}
//componentvnode.type为component类型
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(initinalVNode, container) {
    var instance = createComponentInstance(initinalVNode);
    setupComponent(instance);
    setupRenderEffect(instance, initinalVNode, container);
}
function setupRenderEffect(instance, initinalVNode, container) {
    var proxy = instance.proxy;
    var subTree = instance.render.call(proxy);
    patch(subTree, container);
    //element ->mount
    initinalVNode.el = subTree.el;
}

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
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === "string"
        ? 1 /* element */
        : 2 /* stateful_component */;
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

export { createApp, h };
