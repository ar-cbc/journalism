import { readFileSync } from "fs"
import resolve from "@rollup/plugin-node-resolve"
import terser from "@rollup/plugin-terser"
import commonjs from "@rollup/plugin-commonjs"
import typescript from "@rollup/plugin-typescript"
import { visualizer } from "rollup-plugin-visualizer"
import meta from "./package.json" with { type: "json" }

const copyright = readFileSync("./LICENSE", "utf-8")
    .split(/\n/g)
    .filter((line) => /^Copyright\s+/.test(line))
    .map((line) => line.replace(/^Copyright\s+/, ""))
    .join(", ")

const banner = `// ${meta.homepage} v${meta.version} Copyright ${copyright}`

export default [
    {
        input: "src/bundle.ts",
        output: {
            file: `dist/${meta.name}.js`,
            name: "journalism",
            format: "umd",
            indent: false,
            extend: true,
            banner: banner,
            sourcemap: true,
        },
        plugins: [
            typescript(),
            commonjs(),
            resolve({
                browser: true,
            }),
        ],
        onwarn(message, warn) {
            if (
                message.code === "CIRCULAR_DEPENDENCY" ||
                message.code === "THIS_IS_UNDEFINED"
            )
                return
            warn(message)
        },
    },
    {
        input: "src/bundle.ts",
        output: {
            file: `dist/${meta.name}.min.js`,
            name: "journalism",
            format: "umd",
            indent: false,
            extend: true,
            banner: banner,
            sourcemap: true,
        },
        plugins: [
            typescript(),
            commonjs(),
            resolve({
                browser: true,
            }),
            terser({
                output: {
                    preamble: banner,
                },
            }),
            visualizer(() => {
                return { gzipSize: true, filename: "bundleSizeMin.html" }
            }),
        ],
        onwarn(message, warn) {
            if (
                message.code === "CIRCULAR_DEPENDENCY" ||
                message.code === "THIS_IS_UNDEFINED"
            )
                return
            warn(message)
        },
    },
    {
        input: "src/bundle.ts",
        output: {
            file: `dist/${meta.name}.mjs`,
            name: "journalism",
            format: "esm",
            indent: false,
            extend: true,
            banner: banner,
            sourcemap: true,
        },
        plugins: [
            typescript(),
            commonjs(),
            resolve({
                browser: true,
            }),
        ],
        onwarn(message, warn) {
            if (
                message.code === "CIRCULAR_DEPENDENCY" ||
                message.code === "THIS_IS_UNDEFINED"
            )
                return
            warn(message)
        },
    },
]
