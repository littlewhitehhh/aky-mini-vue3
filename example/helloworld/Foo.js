import { h } from "../../lib/mini-vue.esm.js";

export const Foo = {
    name: "Foo",
    setup(props) {
        //props.count
        console.log(props);
        // props.count++;
        //props readonly
    },
    render() {
        return h("div", {}, "foo : " + this.count);
    },
};