import { readFileSync } from 'node:fs';

import { defineTemplate, parseFormats, parseManifest } from '@tyto/core';
import { compileTemplate } from '@tyto/template-kit/testing';
import { describe, expect, it } from 'vitest';

import { build } from '../src/template.js';

/**
 * Each example brief, compiled the way Tyto compiles it (Tyto ADR 0152), against the HTML the
 * template produced last time it was reviewed, one file per frame.
 *
 * Nothing is measured and every face is a placeholder, so the snapshot moves when the
 * composition does and not when a machine has another font. No brand kit either: the logo and
 * signature are the house's and stay out of this public repository.
 */

const read = (path: string): string => readFileSync(new URL(path, import.meta.url), 'utf8');

const manifest = parseManifest(
  read('../templates/simulados-semana/manifest.yaml'),
  'manifest.yaml',
);
if (!manifest.ok) throw new Error(manifest.error.map((item) => item.message).join('\n'));
const template = defineTemplate(manifest.value, build);
const parsedFormats = parseFormats(read('../templates/formats.yaml'), 'formats.yaml');
if (!parsedFormats.ok) throw new Error(parsedFormats.error.map((item) => item.message).join('\n'));
const formats = parsedFormats.value;

const EXAMPLES = [
  { name: 'roxo', frames: ['story'] },
  { name: 'ocre', frames: ['grid', 'grid', 'story', 'story'] },
  { name: 'vinho', frames: ['grid', 'story'] },
] as const;

describe.each(EXAMPLES)('the example $name', ({ name, frames }) => {
  it(`compiles to ${frames.length} frames, each as drawn last time`, async () => {
    const result = await compileTemplate({
      brief: read(`../templates/simulados-semana/examples/${name}.brief`),
      template,
      formats,
    });
    if (!result.ok) throw new Error(result.error.map((item) => item.message).join('\n'));

    expect([...result.value.frames.map((frame) => frame.format)].sort()).toEqual(
      [...frames].sort(),
    );
    for (const [index, frame] of result.value.frames.entries()) {
      await expect(frame.html).toMatchFileSnapshot(
        `./__snapshots__/${name}-${index + 1}-${frame.format}.html`,
      );
    }
  });
});
