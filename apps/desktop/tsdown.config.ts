import { defineConfig } from "tsdown";

export default defineConfig([
  {
    entry: {
      main: "src/main.ts",
    },
    format: ["cjs"],
    outDir: "dist-electron",
    platform: "node",
    target: "node20",
    clean: true,
    dts: false,
    sourcemap: true,
    shims: false,
    external: ["electron", "electron-updater"],
  },
  {
    entry: {
      preload: "src/preload.ts",
    },
    format: ["cjs"],
    outDir: "dist-electron",
    platform: "node",
    target: "node20",
    clean: false,
    dts: false,
    sourcemap: true,
    shims: false,
    external: ["electron"],
  },
]);
