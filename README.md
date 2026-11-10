# My Personal Website

The source of [sergiudm.github.io](https://sergiudm.github.io): publications, news, and a blog. It is a static site built with [Hugo](https://gohugo.io/) (0.158 or newer) and a small theme that lives in this repository.

```bash
hugo server -D        # preview locally, drafts included, at http://localhost:1313
hugo --minify --gc    # production build into public/ (what CI deploys)
```

## Where things live

| Path | What it holds |
| --- | --- |
| `config/_default/params.toml` | Name, affiliation, interests, social links, article options |
| `content/_index.md` | The bio on the homepage |
| `data/publications.yaml` | Publications (newest first); `selected: true` puts one on the homepage |
| `data/news.yaml` | News items on the homepage |
| `data/projects.yaml` | Projects on the homepage |
| `content/post/<name>/index.md` | Blog posts, each with its images in the same folder |
| `layouts/`, `assets/css/`, `assets/js/` | The theme |
| `layouts/_partials/teasers/` | SVG teaser figures for publications |

## Writing posts

Posts are Markdown. Besides the usual, they can use:

- **Callouts**: `> [!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, `[!CAUTION]` (add `-` to collapse), or `{{< callout type="example" >}}`.
- **Figures**: `![alt](image.png "caption")`, with `{.wide}`, `{.full}`, or `{.narrow}` on the next line; `{{< figure dark="..." >}}` for a dark-mode variant; `{{< gallery >}}`; `{{< compare >}}` for a before/after slider.
- **Diagrams and charts**: fenced `mermaid` blocks, and fenced `chart` blocks holding a Chart.js config.
- **Math**: `$...$` and `$$...$$`, rendered with KaTeX at build time.
- **Structure**: `{{< tabs >}}`, `{{< steps >}}`, `{{< columns >}}`, `{{< stats >}}`, `{{< timeline >}}`, margin notes with `{{< sidenote >}}`.
- **Code and demos**: code blocks get copy buttons (`{title="file.py"}` adds a file name), `{{< terminal >}}` for shell sessions, `{{< demo >}}` for inline interactive HTML, `{{< embed >}}` and `{{< video >}}`, and `{{< pub "id" >}}` for a publication card.

The draft post `content/post/visual-components/` shows every component with its source; open it with `hugo server -D`.
