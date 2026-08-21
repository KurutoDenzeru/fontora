// @ts-nocheck
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"
import react from "@astrojs/react"

// Vite now uses Oxc for transforms (see https://oxc.rs) and Rolldown for dep optimization.
// `esbuild` → `oxc` and `optimizeDeps.esbuildOptions` → `optimizeDeps.rolldownOptions` are
// deprecated — Vite converts them automatically, but @vitejs/plugin-react 5.2+ already emits
// `oxc` + `optimizeDeps.rolldownOptions` when running on Vite 8 (rolldown-vite). Pinning
// vite@8.2.2 at the project root aligns the top-level `vite` with astro's internal
// vite@8.2.2, making `"rolldownVersion" in vite` true so the plugin returns `oxc` config
// and the deprecated `esbuild` warnings disappear without suppression hacks.
// https://vite.dev/guide/migration#javascript-transforms-by-oxc
// https://vite.dev/guide/migration#dependency-optimizer-now-uses-rolldown
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [react()],
})
