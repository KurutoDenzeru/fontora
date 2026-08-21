import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa6"

/**
 * Site footer. Rendered server-side from the layout with no client directive,
 * so it ships zero JavaScript.
 *
 * Socials: swap the hrefs here once the real handles exist.
 */
const SOCIALS = [
  { label: "GitHub", href: "https://github.com/KurutoDenzeru/fontora", Icon: FaGithub },
  { label: "Instagram", href: "https://instagram.com/", Icon: FaInstagram },
  { label: "LinkedIn", href: "https://linkedin.com/", Icon: FaLinkedin },
]

const LINK_COLUMNS: Array<{ title: string; links: Array<{ label: string; href: string }> }> = [
  {
    title: "Catalog",
    links: [
      { label: "All families", href: "/" },
      { label: "Variable fonts", href: "/?style=variable" },
      { label: "Recently added", href: "/?sort=newest" },
      { label: "Collections", href: "/#collections" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Fontsource CDN", href: "https://fontsource.org" },
      { label: "Google Fonts", href: "https://fonts.google.com" },
      { label: "Open Font License", href: "https://openfontlicense.org" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6">
        <div className="grid gap-10 py-12 md:grid-cols-[1fr_auto_auto] md:gap-16">
          <div className="flex max-w-xs flex-col gap-4">
            <span className="text-lg font-semibold tracking-tight">Fontora</span>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A curated catalog of open-source type. Live specimens, variable playgrounds, and embed
              snippets for every family.
            </p>
            <div className="flex items-center gap-1">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {LINK_COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title} className="flex flex-col gap-3">
              <h3 className="text-sm font-medium">{column.title}</h3>
              {column.links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="w-fit text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Fontora</span>
          <span>Fonts served by the Fontsource CDN. Every family ships with its license.</span>
        </div>

        <div aria-hidden="true" className="select-none overflow-hidden pb-2">
          <p className="text-center text-[16vw] leading-[0.85] font-semibold tracking-tighter text-foreground/5">
            Fontora
          </p>
        </div>
      </div>
    </footer>
  )
}
