import { h, ref } from "../../lib/mini-vue.esm.js";

export const App = {
    name: "App",

    render() {
        // window.self = this;
        // console.log(this.count);   // count refImpl对象        count
        return h("div", { id: "root" }, [
            h("button", { onClick: this.onClick }, "click"),
            h("div", {}, "count" + this.count), //  render函数当作依赖，用effect包裹 ==》触发render==》 依赖收集
        ]);
    },
    setup() {
        const count = ref(0);

        const onClick = () => {
            count.value++;
        };

        return {
            count,
            onClick,
        };
    },
};