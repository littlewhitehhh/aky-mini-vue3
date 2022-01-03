import { createApp } from "../../lib/mini-vue.esm.js";
import { App } from "./App.js";

const rootContainer = document.getElementById("app");
// console.log(rootContainer);
createApp(App).mount(rootContainer);