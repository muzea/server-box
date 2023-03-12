import { defineConfig } from "vite";
import externalGlobals from "rollup-plugin-external-globals";
// import { visualizer } from "rollup-plugin-visualizer";
// @ts-ignore
import createExternal from "vite-plugin-external";

const externals = {
  react: "React",
  "react-dom": "ReactDOM",
  filer: "Filer",
};

export default defineConfig({
  root: "src",
  build: {
    target: "chrome94",
    outDir: "../dist",
    rollupOptions: {
      external: Object.keys(externals),
      output: [
        {
          globals: externals,
        },
      ],
      plugins: [
        externalGlobals(externals),
        // visualizer({ emitFile: true, open: true }),
      ],
    },
  },
  plugins: [
    // @ts-ignore
    createExternal({
      development: {
        externals,
      },
    }),
  ],
});
