function isObject(val) {
    return val !== null && typeof val === "object";
}

function createComponentInstance(vnode) {
    var component = {
        vnode: vnode,
        type: vnode.type,
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
    console.log(vnode.type);
    if (typeof vnode.type === "string") {
        // element类型
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
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
    var el = document.createElement(vnode.type);
    // el.setttribute("id", "root");
    var props = vnode.props;
    for (var key in props) {
        var val = props[key];
        el.setAttribute(key, val);
    }
    // el.textContent = "hi mini-vue";
    var children = vnode.children;
    if (typeof children === "string") {
        //children为srting类型
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
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
function mountComponent(vnode, container) {
    var instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
    var subTree = instance.render();
    patch(subTree, container);
}

function createVNode(type, props, children) {
    var vnode = {
        type: type,
        props: props,
        children: children,
    };
    return vnode;
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
