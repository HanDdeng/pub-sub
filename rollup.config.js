import { defineConfig } from "rollup";

import typescript from "@rollup/plugin-typescript";
import clear from "rollup-plugin-clear";
import terser from "@rollup/plugin-terser";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default defineConfig({
  input: "src/index.ts",
  output: [
    {
      dir: "./dist/cjs",
      format: "cjs",
      sourcemap: true,
      entryFileNames: "[name].cjs",
      chunkFileNames: "[name]-[hash].cjs",
    },

    {
      dir: "./dist/esm",
      sourcemap: true,
      entryFileNames: "[name].js",
      chunkFileNames: "[name]-[hash].js",
    },
  ],
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json",
      outDir: undefined,
      emitDeclarationOnly: false,
      declaration: false,
      declarationMap: false,
      declarationDir: undefined,
    }),
    terser(),
    clear({
      targets: ["dist"],
      watch: true,
    }),
    resolve(),
    commonjs(),
  ],
});
