import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/bin.ts"],
    splitting: false,
    sourcemap: false,
    clean: true,
    dts: false,
    format: ["esm"],
    minify: true,
    target: "es2022",
});
