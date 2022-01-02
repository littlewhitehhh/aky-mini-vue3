var PublicPropertiesMap = {
    $el: function (i) { return i.vnode.el; },
};
var PublicInstanceProxyHandlers = {
    get: function (_a, key) {
        var instance = _a._;
        //setupState
        var setupState = instance.setupState;
        if (key in setupState) {
            return setupState[key];
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
    };
    return component;
}
function setupComponent(instance) {
    // TODO
    // initProps()
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
        var setupResult = setup();
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
        el.setAttribute(key, val);
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
