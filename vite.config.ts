import { defineConfig } from "vite";
import externalGlobals from "rollup-plugin-external-globals";
// import { visualizer } from "rollup-plugin-visualizer";
// @ts-ignore
import createExternal from "vite-plugin-external";

export default defineConfig({
  root: "src",
  build: {
    target: "chrome94",
    outDir: "../dist",
    rollupOptions: {
      external: ["react", "react-dom"],
      output: [
        {
          globals: { react: "React", "react-dom": "ReactDOM" },
        },
      ],
      plugins: [
        externalGlobals({
          react: "React",
          "react-dom": "ReactDOM",
        }),
        // visualizer({ emitFile: true, open: true }),
      ],
    },
  },
  plugins: [
    createExternal({
      development: {
        externals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    }),
  ],
});
