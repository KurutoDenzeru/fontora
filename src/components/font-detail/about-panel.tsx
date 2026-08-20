import { Badge } from "@/components/ui/badge"
import { tags } from "@/data/curation"
import type { FontMeta } from "@/lib/fonts"

interface Props {
  font: FontMeta
}

const LICENSE_INFO: Record<string, { summary: string; url: string }> = {
  "OFL-1.1": {
    summary:
      "SIL Open Font License. Free to use, study, modify, and redistribute, including in commercial products, as long as the font itself is not sold on its own.",
    url: "https://openfontlicense.org",
  },
  "Apache-2.0": {
    summary:
      "Apache License 2.0. Free to use, modify, and distribute, including commercially, with patent grant and trademark limits.",
    url: "https://www.apache.org/licenses/LICENSE-2.0",
  },
  "UFL-1.0": {
    summary:
      "Ubuntu Font License. Free to use, study, modify, and redistribute for most purposes, including commercial use.",
    url: "https://ubuntu.com/legal/font-licence",
  },
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:gap-6">
      <dt className="w-32 shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-sm">{children}</dd>
    </div>
  )
}

export default function AboutPanel({ font }: Props) {
  const license = LICENSE_INFO[font.license]
  const fontTags = tags[font.id] ?? []

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <section aria-label="License">
        <h3 className="mb-3 flex items-center gap-2 text-base font-medium">
          License
          <Badge variant="secondary">{font.license}</Badge>
        </h3>
        {license ? (
          <p className="max-w-[55ch] text-sm leading-relaxed text-muted-foreground">
            {license.summary}{" "}
            <a
              href={license.url}
              target="_blank"
              rel="noreferrer"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Read the full license
            </a>
          </p>
        ) : (
          <p className="max-w-[55ch] text-sm leading-relaxed text-muted-foreground">
            Distributed under {font.license}. Check the source repository for the full text.
          </p>
        )}
      </section>

      <section aria-label="Metadata">
        <h3 className="mb-1 text-base font-medium">Details</h3>
        <dl className="flex flex-col divide-y">
          <MetaRow label="Category">{font.category}</MetaRow>
          <MetaRow label="Weights">{font.weights.join(", ")}</MetaRow>
          <MetaRow label="Styles">{font.styles.join(", ")}</MetaRow>
          <MetaRow label="Subsets">{font.subsets.join(", ")}</MetaRow>
          {font.variable && font.axes && (
            <MetaRow label="Variable axes">
              {Object.entries(font.axes)
                .map(([tag, a]) => `${tag} ${a.min}-${a.max}`)
                .join(", ")}
            </MetaRow>
          )}
          <MetaRow label="Last updated">{font.lastModified}</MetaRow>
          <MetaRow label="npm">
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              {font.variable ? `@fontsource-variable/${font.id}` : `@fontsource/${font.id}`}
            </code>
          </MetaRow>
          <MetaRow label="Source">
            <a
              href="https://github.com/google/fonts"
              target="_blank"
              rel="noreferrer"
              className="underline-offset-4 hover:underline"
            >
              google/fonts
            </a>
          </MetaRow>
          {fontTags.length > 0 && (
            <MetaRow label="Tags">
              <span className="flex flex-wrap gap-1.5">
                {fontTags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </span>
            </MetaRow>
          )}
        </dl>
      </section>
    </div>
  )
}
