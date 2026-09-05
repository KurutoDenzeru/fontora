![Fontora](/public/OpenGraph.webp)

# ✒️ Fontora - Curated Open-Source Font Catalog

✒️ Curated catalog of 1,900+ open-source fonts with live specimens, variable axis playgrounds, pairing suggestions, and embed snippets. Built with Astro, React, TypeScript, Tailwind, and shadcn/ui.

## ☁️ Deploy your own

[![Deploy with Vercel](_deploy_vercel.svg)](https://vercel.com/new/clone?repository-url=https://github.com/KurutoDenzeru/fontora)  [![Deploy with Netlify](_deploy_netlify.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/KurutoDenzeru/fontora)

## ✨ Features

- **1,900+ Curated Families** — Every open-source Google Font, prerendered as its own fast, static page with full metadata.
- **Live Specimens** — Type, resize, and test every font instantly with real previews and CSS fallback stacks.
- **Variable Axis Playgrounds** — Drag weight, width, and optical size axes to explore variable fonts in real time.
- **Pairing Suggestions** — Curated font pairings shown on every family page for design-ready combinations.
- **Embed Snippets** — Copy-ready CSS and code snippets for using any font in your own project.
- **Smart Browsing** — Search plus filters by category, writing system, weights, and variable support.
- **Selection Bag** — Collect fonts as you browse, then review and compare your picks in one tray.
- **Responsive & Accessible** — Mobile-first UI with dark, light, and system themes built with Tailwind and shadcn/ui.

## 🧱 Tech Stack

- [Astro](https://astro.build/): Static site framework prerendering 1,900+ pages with zero-JS by default.
- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/): Interactive islands for specimens, playgrounds, and the catalog browser.
- [Tailwind CSS](https://tailwindcss.com/): Utility-first CSS framework used for styling.
- [shadcn/ui](https://ui.shadcn.com/) + [Base UI](https://base-ui.com/): Re-usable accessible components built on Radix patterns.
- [Fontsource](https://fontsource.org/): Font files, metadata, and the `@fontsource-variable` packages powering previews and embeds.
- [Vite](https://vite.dev/): Dev server and bundler under the hood.
- [Bun](https://bun.sh/): Package manager, runtime, and script runner for catalog syncing.

## ⚡ Getting Started

Clone the repo, install deps, and boot the dev server:

```bash
git clone https://github.com/KurutoDenzeru/fontora.git
cd fontora
bun install
bun run dev
```

Open [http://localhost:4321](http://localhost:4321) to view the app.

## 📦 Build for Production

```bash
bun run build
bun run preview
```

## 🗂️ Configuration

The site is componentized under `src/`. Key areas to customize are:

```text
src/
	pages/
		index.astro             # Catalog home: hero, search, collections, marquee
		fonts/[id].astro        # Font detail pages, prerendered per family
	layouts/
		main.astro              # Root layout, metadata, canonical URLs, JSON-LD
	components/
		catalog/                # Browser, filter sidebar, search, collection rows, marquee
		font-detail/            # Specimen tabs, style list, glyph grid, pairings, embed panel
		selection/              # Selection bag tray
		dock-nav.tsx            # Floating glass dock navigation
		site-footer.tsx         # Footer links and credits
	lib/
		fonts.ts                # FontMeta types, style counting, fallback stacks
	data/
		fonts.json              # Synced Google Fonts catalog (1,900+ families)
		curation.ts             # Curated collections, pairings, showcase picks
styles/
	global.css              # Tailwind entry, theme tokens, font imports
scripts/
	sync-fonts.ts           # Refreshes catalog data from Fontsource (bun run sync:fonts)
```

## 🤝🏻 Contributing

Contributions are always welcome, whether you're fixing bugs, improving docs, or shipping new features that make the project better for everyone.

Check out [Contributing.md](Contributing.md) to learn how to get started and follow the recommended workflow.

## ⚖️ License

This project is released under the MIT License, giving you the freedom to use, modify, and distribute the code with minimal restrictions.

All font specimens showcased on the site remain under their respective upstream licenses (SIL OFL 1.1, Apache 2.0, UFL 1.0) as distributed via [Google Fonts](https://fonts.google.com) and [Fontsource](https://fontsource.org).
