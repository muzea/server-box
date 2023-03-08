import { defineConfig } from "vite";
import createExternal from "vite-plugin-external";

export default defineConfig({
  root: "src",
  build: {
    outDir: "../dist",
    // rollupOptions: {
    //   external: ['react', 'react-dom'],
    //   output: [
    //     {
    //       globals: { react: 'React', 'react-dom': 'ReactDOM' }
    //     }
    //   ]
    // },
  },
  plugins: [
    createExternal({
      externals: {
        react: "React",
        "react-dom": "ReactDOM",
      },
    }),
  ],
});
