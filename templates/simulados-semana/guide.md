# How to write a `simulados-semana` brief

`simulados-semana` is the week's mock-exam agenda, as a grid carousel and as stories: the title
on every slide, then each day's schedule and its exams. The same piece serves several brands
through configurations; a configuration usually gives it another name (an alias such as
`simulados-semana-<name>`) and may allow fewer formats. Write the name the person uses, and
ask for only the formats that name allows.

## Slots

| Slot      | Where                          | Rule                                                                                                                                                                               |
| --------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `titulo`  | directive                      | **Required**, at most 60 characters, usually `Agenda de Simulados`. Drawn on **every** slide. Each line of the block is one line on the slide.                                     |
| `chamada` | directive                      | Optional, at most 60 characters: the words of the call to comment on the last grid. Without it the grid has its default call. Write it only when the copy brings another sentence. |
| `nota`    | directive                      | Optional, at most 60 characters: a line drawn at the bottom instead of the signature, such as a pointer to the story's link. A configuration may set it for you.                   |
| `selo`    | frontmatter                    | Optional, 1080×140, glued to the foot of the **last grid slide**, never on a story: `selo: ./selo.png`. Only when the person has the file.                                         |
| `lamina`  | directive, repeated 1–12 times | One slide each.                                                                                                                                                                    |

Formats: `formats: [grid, story]`, or one of them when the person asks. A configuration that
publishes no grid refuses `grid`; there, `chamada` and `selo` have nothing to be drawn on.

## Normalisation

Inside each `::lamina`:

- **A line with one `|` opens a day: `day | schedule`**, such as
  `Domingo 25/10 | Aplicação às 08h30 & correção às 14h`.
- **Each line with no `|` under it is one mock exam** of that day:
  `1º Simulado Órgão Alfa - Pós-edital`.
- **Careful: this is the opposite of the agenda and approved-list templates**, where the line
  with no `|` is the group.
- **Day:** weekday with a capital initial and the date `DD/MM`: `Domingo 25/10`, `Sábado 31/10`.
  Check on a calendar that the weekday matches the date; if it does not, ask.
- **Schedule:** as it came, but in the pattern `Aplicação às 08h30 & correção às 14h` when the
  copy gives both times. Hours as `08h30`, `14h`.
- **Mock exam:** literal, only trimmed. Do not correct career or exam body names.
- A mock exam never holds `|`. If the copy has one, replace it with `-` and say so.

The template draws by itself, so the brief never writes: the brand's signature (or the `nota`),
the logo on the grid and the call to comment on the last grid.

## How to split into slides

The same `::lamina` becomes the grid **and** the story, so **it has to fit the grid**, the
shorter of the two. In the example about **3 mock exams in 2 days** fit one slide. A slide that
does not fit runs off the bottom of the grid; Tyto warns `W_TEMPLATE_OVERFLOW`. With more
content, propose more slides and ask. A story-only configuration holds more, but its limit was
not measured: ask there too.

## Example

Copy (invented):

```
Agenda de Simulados
Domingo 25/10 - aplicação 8h30, correção 14h
1º Simulado Órgão Alfa - Pós-edital
1º Simulado Tribunal Beta - Pré-edital
Sábado 31/10 - aplicação 8h30, correção 14h
2º Simulado Instituto Gama - Regular
Domingo 01/11 - aplicação 8h30, correção 14h
1º Simulado Agência Delta - Pós-edital
```

Brief (four exams do not fit one grid, so two slides):

```brief
---
template: simulados-semana
formats: [grid, story]
---
::titulo
  Agenda de Simulados

::lamina
  Domingo 25/10 | Aplicação às 08h30 & correção às 14h
  1º Simulado Órgão Alfa - Pós-edital
  1º Simulado Tribunal Beta - Pré-edital
  Sábado 31/10 | Aplicação às 08h30 & correção às 14h
  2º Simulado Instituto Gama - Regular

::lamina
  Domingo 01/11 | Aplicação às 08h30 & correção às 14h
  1º Simulado Agência Delta - Pós-edital
```

## Known traps

- The brand decides the name (the configuration) the brief writes. When the copy does not say
  which brand the piece is for and its content does not make it clear, ask.
- `grid` under a story-only configuration is refused: ask for `story` only there.
