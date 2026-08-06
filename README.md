# ricardo-pc.github.io

Source for my personal site: [ricardo-pc.github.io](https://ricardo-pc.github.io)

Data scientist with 4+ years at McKinsey and Deloitte and an M.A. in Statistics from UC Berkeley. The site collects ten projects across AI agent systems, machine learning, and applied statistics, each written up with what it does, what the numbers were, and where it falls short.

## Build

Built with [Quarto](https://quarto.org). Sources are the `.qmd` files at the repo root and under `posts/`; the rendered site is committed to `docs/`, which GitHub Pages serves.

```bash
quarto render
```

```bash
quarto preview
```

Edit the `.qmd` sources, never the generated HTML in `docs/` — `quarto render` overwrites it.

## Layout

| Path | Contents |
|---|---|
| `index.qmd` | Home: hero, featured projects, skills, education, experience |
| `projects.qmd` | Listing page, generated from `posts/` |
| `coursework.qmd` | Berkeley coursework, linked to the projects each course produced |
| `posts/<slug>/index.qmd` | One project write-up, with its images alongside |
| `styles.css` | Design tokens and component styles |
| `_quarto.yml` | Site config, navigation, SEO and social metadata |

## Note on `docs/site_libs/`

This repo lives in a OneDrive-synced folder, and OneDrive has been observed removing the vendored assets in `docs/site_libs/` from the working tree while they remain committed. Committing that deletion would publish the site with no CSS or JavaScript. Before committing, confirm:

```bash
find docs/site_libs -type f | wc -l
```

It should report 20. If it reports 0, run `git restore docs/site_libs` or `quarto render` before committing.
