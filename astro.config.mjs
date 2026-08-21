// @ts-nocheck
// oxc fix for Vite 7 Rolldown - see https://oxc.rs/docs/guide/usage/vite

import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"
import react from "@astrojs/react"

// Vite 7 (Rolldown) deprecates `esbuild` in favor of `oxc` and `optimizeDeps.esbuildOptions` in favor of `optimizeDeps.rolldownOptions`.
// The internal `vite:react-babel` plugin still emits the old keys, so we translate them here.
// See https://oxc.rs/docs/guide/usage/vite
function oxcFixPlugin() {
  return {
    name: "fix-esbuild-to-oxc",
    enforce: "post",
    // @ts-ignore - Vite config shape varies by version
    config(config) {
      // Vite 7 deprecates esbuild in favor of oxc. The react plugin still emits esbuild
      // config; we drop it and let Vite use its default oxc handling.
      if ((/** @type {any} */ (config)).esbuild) {
        delete (/** @type {any} */ (config)).esbuild;
      }
      // Translate optimizeDeps.esbuildOptions -> optimizeDeps.rolldownOptions
      const od = /** @type {any} */ (config).optimizeDeps;
      if (od && od.esbuildOptions) {
        od.rolldownOptions = od.esbuildOptions;
        delete od.esbuildOptions;
      }
    },
  };
}

function suppressEsbuildWarnPlugin() {
  return {
    name: "suppress-esbuild-warn",
    enforce: "post",
    configResolved(config) {
      const logger = /** @type {any} */ (config).logger;
      if (!logger || !logger.warn) return;
      const origWarn = logger.warn.bind(logger);
      logger.warn = (msg, opts) => {
        if (typeof msg === "string" && msg.includes("esbuild") && msg.includes("oxc")) return;
        if (typeof msg === "string" && msg.includes("esbuildOptions") && msg.includes("rolldownOptions")) return;
        origWarn(msg, opts);
      };
    },
  };
}

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss(), oxcFixPlugin(), suppressEsbuildWarnPlugin()],
  },
  integrations: [react()],
})
