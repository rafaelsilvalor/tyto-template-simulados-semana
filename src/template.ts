/**
 * `simulados-semana` — the week's mock-exam agenda, one template for every brand that draws it.
 *
 * The composition is `@tyto/house-style`'s, the one Tyto's three built-in templates applied to
 * roxo, ocre and vinho. What told them apart moved out of the code:
 *
 * - **The accent, the logo and the signature** are the brand kit's, and a plugin file's
 *   configuration picks the brand (Tyto ADR 0155). Without a kit the accent falls back to
 *   ocre's, the manifest's brand.
 * - **roxo's note** in place of the signature is copy, not brand: it is the `nota` slot, which
 *   roxo's configuration fills on the brief's side (ADR 0155 decision 7).
 * - **roxo's missing grid** is the configuration's formats restriction, not this code's.
 */

import { type Brand, OCRE, simuladosDaSemana } from '@tyto/house-style';
import { plain } from '@tyto/template-kit';

import type { TemplateBuild, TemplateContext } from '@tyto/core';

/** The brand drawn when nothing else is known: the manifest's, ocre. */
export const FALLBACK: Brand = OCRE;

/** The brief's `nota`, when it wrote one. */
function noteOf(context: TemplateContext): string | undefined {
  const value = context.slots['nota']?.value;
  if (value?.kind !== 'rich-text') return undefined;
  const text = plain(value.text);
  return text === '' ? undefined : text;
}

export const build: TemplateBuild = (context) => {
  const note = noteOf(context);
  const own: Brand =
    note === undefined ? FALLBACK : { ...FALLBACK, signOff: { kind: 'note', text: note } };
  return simuladosDaSemana(own)(context);
};
