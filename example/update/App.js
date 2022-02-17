import { h, ref } from "../../lib/mini-vue.esm.js";

export const App = {
    name: "App",

    render() {
        // window.self = this;
        // console.log(this.count);   // count refImpl对象        count
        return h("div", { id: "root", ...this.props }, [
            h("button", { onClick: this.onClick }, "click"),
            h("div", {}, "count" + this.count), //  render函数当作依赖，用effect包裹 ==》触发render==》 依赖收集

            //props

            h("button", { onClick: this.onChangePropsDemo1 }, "changeProps - foo的值改变了"),
            h("button", { onClick: this.onChangePropsDemo2 }, "changeProps - foo的值改变了为undefined"),
            h("button", { onClick: this.onChangePropsDemo3 }, "changeProps - bar没有了"),
        ]);
    },
    setup() {
        const count = ref(0);

        const onClick = () => {
            count.value++;
        };

        //props
        const props = ref({
            foo: "foo",
            bar: "bar",
        });

        const onChangePropsDemo1 = () => {
            props.value.foo = "new-foo";
        };
        const onChangePropsDemo2 = () => {
            props.value.foo = "undefined";
        };
        const onChangePropsDemo3 = () => {
            props.value = {
                foo: "foo",
            };
        };
        return {
            count,
            onClick,
            props,
            onChangePropsDemo1,
            onChangePropsDemo2,
            onChangePropsDemo3,
        };
    },
};