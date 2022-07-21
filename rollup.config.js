import pkg from './package.json'

import typescript from '@rollup/plugin-typescript'
export default {

    input: "./src/index.ts",
    output: [

        // 1.cjs commonjs
        // 2.esm    esmodule
        {
            format: "cjs",
            // file: "lib/mini-vue.cjs.js"
            file: pkg.main
        },
        {
            format: "es",
            // file: "lib/mini-vue.esm.js"
            file: pkg.module
        }
    ],

    plugins: [
        typescript()
    ]

}