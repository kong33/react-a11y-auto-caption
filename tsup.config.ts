import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.tsx", "src/next.tsx"],
  format: ["cjs", "esm"],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom"],
});
