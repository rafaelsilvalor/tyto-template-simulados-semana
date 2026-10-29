# tyto-template-simulados-semana

`simulados-semana`, a [Tyto](https://github.com/rafaelsilvalor/tyto) code template in its own
repository: the week's mock exams as a carousel and as stories — the title, then each day's
schedule and its exams, and on the last grid a call to comment.

It replaces Tyto's three built-in templates `simulados-semana-roxo`, `-ocre` and `-vinho`, which
were one composition in three brands, with **one template and three configurations** (TYTO-441,
Tyto ADR 0151 and ADR 0155). The names briefs use today become the configurations' aliases.

**This repository holds the composition only.** The logo, the signature and the brand's accent
are not here: a configuration picks a brand, and Tyto hands the template that brand's kit from
the brand kit installed on the machine. Without one it draws placeholders and ocre's accent, the
manifest's brand (Tyto ADR 0063, ADR 0065, ADR 0155). The example briefs carry the neutral copy
of Tyto's built-in fixtures.

## Use it from a plugin file

A plugin file fetches the template at a tag and names its configurations (Tyto ADR 0151). Put
this in `.tyto/plugin-files/simulados-semana.yaml` beside a project's briefs, or in
`TYTO_HOME/plugin-files/` for every project on the machine:

```yaml
version: 1
templates:
  simulados-semana:
    source:
      git: https://github.com/rafaelsilvalor/tyto-template-simulados-semana.git
      ref: v1.0.0
    configurations:
      # No `alias` lines: each configuration's alias is `simulados-semana-<name>`, the name
      # briefs already write.
      roxo:
        brand: roxo
        formats: [story] # roxo publishes no grid: a brief asking for one is refused
        brief:
          slots:
            nota: Clique no link para mais informações
      ocre:
        brand: ocre
      vinho:
        brand: vinho
```

A brief then starts as it does today:

```
---
template: simulados-semana-roxo
formats: [story]
---
```

A pack brings templates and no formats. Copy `templates/formats.yaml` into the project that
renders `simulados-semana`, or merge its `grid` and `story` lines into the project's own.

**While Tyto still ships its built-in copies, the aliases do not load.** An alias equal to a
built-in template's name is refused and the built-in stands (ADR 0151 decision 7); they load
once Tyto's TYTO-436 removes the three built-in folders.

**`formats: [story]` on a configuration needs Tyto's TYTO-475.** Until a Tyto with it is
released, the key is reported as unknown and ignored, so `simulados-semana-roxo` renders a grid
when a brief asks for one.

## What a configuration may change

| What                   | Where              | Why there                                                                                     |
| ---------------------- | ------------------ | --------------------------------------------------------------------------------------------- |
| The brand              | `brand:`           | The accent, the logo and the signature come with the brand's kit, together (ADR 0155).        |
| The formats            | `formats:`         | A subset of the manifest's `[grid, story]` that a brief cannot widen (ADR 0155, TYTO-475).    |
| The note under the art | `brief.slots.nota` | Copy, not brand: a line drawn instead of the signature, which a brief may still write itself. |
| Nothing else           | `values` is empty  | Sizes and gaps are the house's tokens; the accent is the brand's, never a value (ADR 0153).   |

The brief owns the rest: `titulo`, each `lamina`, the optional `chamada` (the call to comment on
the last grid) and the optional `selo` (a 1080 × 140 seal glued to the foot of the last grid).

## What it may reach

| Permission        | Why                                                                       |
| ----------------- | ------------------------------------------------------------------------- |
| `font:CircularXX` | The exam table and the call to comment are sized by measuring CircularXX. |

**The install asks for it once.** Without it the render warns `W_PLUGIN_FONT_WITHHELD` and the
measured pieces fall back to their unmeasured sizes. On a machine without CircularXX, Tyto
measures and draws its bundled substitute and needs no permission.

## Development

`pnpm check` runs Prettier, the type checker, ESLint and the tests; `pnpm build` writes
`dist/index.js`, one ES module with every `@tyto` import inlined, which is committed and which
CI rebuilds and compares. Tyto runs no build of a fetched repository, so every ref a plugin file
names must hold it.

The template depends on Tyto's published contract, held by GitHub Packages under the owner's
scope (Tyto ADR 0149) and aliased in `package.json`: `@tyto/house-style` draws the piece,
`@tyto/template-kit` and `@tyto/core` are what it is drawn with, and `@tyto/plugin-api` is what
loads it. The committed `.npmrc` names the scope only. GitHub asks for a token with
`read:packages` even for public packages, and it goes in your user-level `~/.npmrc`:

```sh
gh auth refresh -s read:packages
echo '//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}' >> ~/.npmrc
NODE_AUTH_TOKEN=$(gh auth token) pnpm install
```

The tests, all without Tyto:

- `tests/examples.test.ts`: the three example briefs, one per configuration's shape, compiled as
  Tyto compiles them through `@tyto/template-kit/testing` (Tyto ADR 0152), against the HTML in
  `tests/__snapshots__/`. Nothing is measured and faces are placeholders, so a snapshot moves
  when the composition does and not when a machine has another font.
- `tests/configurations.test.ts`: what a configuration changes — a kit's accent and signature
  reach the drawing, ocre's accent without one, `nota` replaces the signature, and the seal sits
  on the last grid and on no story. The manifest declares no `values`.
- `tests/plugin.test.ts`: the built `dist/index.js`, loaded through `@tyto/plugin-api/testing`
  (Tyto ADR 0150), drawing a story across the isolation protocol.

**Renders made on a machine with the private brand kit carry the brand.** Never commit one:
`.gitignore` refuses `*.png` and `*.svg`.

The `contract` workflow runs every day against the newest published contract, past the ranges
`package.json` asks for, and opens a pull request when it passes (Tyto ADR 0154).
