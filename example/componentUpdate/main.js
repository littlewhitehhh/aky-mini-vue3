import { createApp } from '../../lib/mini-vue.esm.js'
import { App } from './app.js'

const rootContainer = document.getElementById("app")

console.log(rootContainer);
createApp(App).mount(rootContainer)