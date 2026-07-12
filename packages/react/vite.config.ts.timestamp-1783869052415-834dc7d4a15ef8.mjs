// vite.config.ts
import react from "file:///home/arc/Source/tweeq/node_modules/.pnpm/@vitejs+plugin-react@4.7.0_vite@5.4.21_@types+node@26.1.1_sass-embedded@1.100.0_sass@1.100.0_stylus@0.63.0_/node_modules/@vitejs/plugin-react/dist/index.js";
import { resolve } from "path";
import dts from "file:///home/arc/Source/tweeq/node_modules/.pnpm/vite-plugin-dts@4.5.4_@types+node@26.1.1_rollup@4.62.2_typescript@5.9.3_vite@5.4.21_@ty_a6d75fdb0a51308c8bb0e3dc2df9de00/node_modules/vite-plugin-dts/dist/index.mjs";
import glsl from "file:///home/arc/Source/tweeq/node_modules/.pnpm/vite-plugin-glsl@1.6.0_@rollup+pluginutils@5.4.0_rollup@4.62.2__vite@5.4.21_@types+node_fc93d8747b65bd8fbdc81e2bbe2f7671/node_modules/vite-plugin-glsl/src/index.js";
import { defineConfig } from "file:///home/arc/Source/tweeq/node_modules/.pnpm/vitest@3.2.7_@types+debug@4.1.13_@types+node@26.1.1_sass-embedded@1.100.0_sass@1.100.0_stylus@0.63.0/node_modules/vitest/dist/config.js";
var __vite_injected_original_dirname = "/home/arc/Source/tweeq/packages/react";
var vite_config_default = defineConfig({
  plugins: [
    glsl(),
    react(),
    dts({
      tsconfigPath: "./tsconfig.build.json",
      rollupTypes: true
    })
  ],
  publicDir: false,
  build: {
    lib: {
      name: "Tweeq",
      entry: resolve(__vite_injected_original_dirname, "src/index.ts"),
      formats: ["es", "cjs"],
      fileName: (format) => format === "es" ? "index.es.js" : "index.cjs"
    },
    outDir: "dist",
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"]
    }
  },
  define: {
    // This is needed to make the PromiseQueue class available in the browser.
    "process.env.PROMISE_QUEUE_COVERAGE": false
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9hcmMvU291cmNlL3R3ZWVxL3BhY2thZ2VzL3JlYWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9hcmMvU291cmNlL3R3ZWVxL3BhY2thZ2VzL3JlYWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL2FyYy9Tb3VyY2UvdHdlZXEvcGFja2FnZXMvcmVhY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXG5pbXBvcnQge3Jlc29sdmV9IGZyb20gJ3BhdGgnXG5pbXBvcnQgZHRzIGZyb20gJ3ZpdGUtcGx1Z2luLWR0cydcbmltcG9ydCBnbHNsIGZyb20gJ3ZpdGUtcGx1Z2luLWdsc2wnXG5pbXBvcnQge2RlZmluZUNvbmZpZ30gZnJvbSAndml0ZXN0L2NvbmZpZydcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcblx0cGx1Z2luczogW1xuXHRcdGdsc2woKSxcblx0XHRyZWFjdCgpLFxuXHRcdGR0cyh7XG5cdFx0XHR0c2NvbmZpZ1BhdGg6ICcuL3RzY29uZmlnLmJ1aWxkLmpzb24nLFxuXHRcdFx0cm9sbHVwVHlwZXM6IHRydWUsXG5cdFx0fSksXG5cdF0sXG5cdHB1YmxpY0RpcjogZmFsc2UsXG5cdGJ1aWxkOiB7XG5cdFx0bGliOiB7XG5cdFx0XHRuYW1lOiAnVHdlZXEnLFxuXHRcdFx0ZW50cnk6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2luZGV4LnRzJyksXG5cdFx0XHRmb3JtYXRzOiBbJ2VzJywgJ2NqcyddLFxuXHRcdFx0ZmlsZU5hbWU6IGZvcm1hdCA9PiAoZm9ybWF0ID09PSAnZXMnID8gJ2luZGV4LmVzLmpzJyA6ICdpbmRleC5janMnKSxcblx0XHR9LFxuXHRcdG91dERpcjogJ2Rpc3QnLFxuXHRcdHJvbGx1cE9wdGlvbnM6IHtcblx0XHRcdGV4dGVybmFsOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdyZWFjdC9qc3gtcnVudGltZSddLFxuXHRcdH0sXG5cdH0sXG5cdGRlZmluZToge1xuXHRcdC8vIFRoaXMgaXMgbmVlZGVkIHRvIG1ha2UgdGhlIFByb21pc2VRdWV1ZSBjbGFzcyBhdmFpbGFibGUgaW4gdGhlIGJyb3dzZXIuXG5cdFx0J3Byb2Nlc3MuZW52LlBST01JU0VfUVVFVUVfQ09WRVJBR0UnOiBmYWxzZSxcblx0fSxcbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWlTLE9BQU8sV0FBVztBQUNuVCxTQUFRLGVBQWM7QUFDdEIsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sVUFBVTtBQUNqQixTQUFRLG9CQUFtQjtBQUozQixJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMzQixTQUFTO0FBQUEsSUFDUixLQUFLO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixJQUFJO0FBQUEsTUFDSCxjQUFjO0FBQUEsTUFDZCxhQUFhO0FBQUEsSUFDZCxDQUFDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsV0FBVztBQUFBLEVBQ1gsT0FBTztBQUFBLElBQ04sS0FBSztBQUFBLE1BQ0osTUFBTTtBQUFBLE1BQ04sT0FBTyxRQUFRLGtDQUFXLGNBQWM7QUFBQSxNQUN4QyxTQUFTLENBQUMsTUFBTSxLQUFLO0FBQUEsTUFDckIsVUFBVSxZQUFXLFdBQVcsT0FBTyxnQkFBZ0I7QUFBQSxJQUN4RDtBQUFBLElBQ0EsUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLE1BQ2QsVUFBVSxDQUFDLFNBQVMsYUFBYSxtQkFBbUI7QUFBQSxJQUNyRDtBQUFBLEVBQ0Q7QUFBQSxFQUNBLFFBQVE7QUFBQTtBQUFBLElBRVAsc0NBQXNDO0FBQUEsRUFDdkM7QUFDRCxDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
