import { readFileSync } from 'node:fs';

import { defineTemplate, parseFormats, parseManifest } from '@tyto/core';
import { OCRE, PLACEHOLDER_SIGNATURE, ROXO, VINHO } from '@tyto/house-style';
import { compileTemplate } from '@tyto/template-kit/testing';
import { describe, expect, it } from 'vitest';

import { FALLBACK, build } from '../src/template.js';

import type { AssetRef, BrandKit } from '@tyto/core';

/**
 * What a plugin file's configuration changes in `simulados-semana`, and what it does not.
 *
 * Tyto's three built-ins differed in the brand they drew, in roxo's note and in roxo's missing
 * grid. The brand arrives as the kit a configuration picks (Tyto ADR 0155), so a kit's accent
 * must reach the drawing; the note is the `nota` slot; and the seal stays the brief's. The
 * template declares no `values`: the accent is the brand's, never a configurable value.
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

const SEAL: AssetRef = { id: 'selo', source: 'file', path: 'selo.png', hash: 'abc' };

interface Options {
  readonly kit?: BrandKit;
  readonly seal?: boolean;
}

/** The brief compiled, every frame's HTML joined, with the kit under the manifest's brand. */
const html = async (brief: string, options: Options = {}): Promise<string> => {
  const result = await compileTemplate({
    brief,
    template,
    formats,
    ...(options.kit === undefined ? {} : { brandKits: new Map([['ocre', options.kit]]) }),
    ...(options.seal === true
      ? {
          assets: { base: '(test)', resolve: () => Promise.resolve(SEAL) },
          asset: () => 'data:image/png;base64,c2VhbA==',
        }
      : {}),
  });
  if (!result.ok) throw new Error(result.error.map((item) => item.message).join('\n'));
  return result.value.frames.map((frame) => frame.html).join('\n');
};

const example = (name: string): string =>
  read(`../templates/simulados-semana/examples/${name}.brief`);

describe('the brand', () => {
  it('declares ocre, whose accent is the fallback, and no configurable values', () => {
    expect(manifest.value.brand).toBe('ocre');
    expect(FALLBACK).toBe(OCRE);
    expect(manifest.value.values ?? {}).toEqual({});
  });

  it("draws ocre's accent with no kit", async () => {
    expect(await html(example('vinho'))).toContain(OCRE.accent);
  });

  it.each([
    ['roxo', ROXO.accent],
    ['vinho', VINHO.accent],
  ])("draws %s's accent when the configuration's kit carries it", async (_, accent) => {
    const drawn = await html(example('vinho'), { kit: { colors: { accent } } });

    expect(drawn).toContain(accent);
    expect(drawn).not.toContain(OCRE.accent);
  });

  it("signs with the kit's signature", async () => {
    const drawn = await html(example('vinho'), { kit: { signature: '@kit-signature' } });

    expect(drawn).toContain('@kit-signature');
    expect(drawn).not.toContain(PLACEHOLDER_SIGNATURE);
  });
});

describe('the note', () => {
  const withoutNote = example('roxo').replace(/::nota\n {2}.*\n\n/, '');

  it("draws the brief's nota where the signature would be", async () => {
    const drawn = await html(example('roxo'));

    expect(drawn).toContain('Clique no link para mais informações');
    expect(drawn).not.toContain(PLACEHOLDER_SIGNATURE);
  });

  it('signs with the signature when the brief writes none', async () => {
    const drawn = await html(withoutNote);

    expect(withoutNote).not.toContain('::nota');
    expect(drawn).not.toContain('Clique no link');
    expect(drawn).toContain(PLACEHOLDER_SIGNATURE);
  });
});

describe('the seal', () => {
  const sealed = example('vinho').replace(
    'formats: [grid, story]',
    'formats: [grid, story]\nselo: ./selo.png',
  );

  it('glues the seal to the last grid and to no story', async () => {
    const result = await compileTemplate({
      brief: sealed,
      template,
      formats,
      assets: { base: '(test)', resolve: () => Promise.resolve(SEAL) },
      asset: () => 'data:image/png;base64,c2VhbA==',
    });
    if (!result.ok) throw new Error(result.error.map((item) => item.message).join('\n'));

    const byFormat = Object.fromEntries(
      result.value.frames.map((frame) => [frame.format, frame.html]),
    );
    expect(byFormat['grid']).toContain('data:image/png;base64,c2VhbA==');
    expect(byFormat['story']).not.toContain('data:image/png;base64,c2VhbA==');
  });

  it('moves the grid when there is a seal', async () => {
    expect(await html(sealed, { seal: true })).not.toBe(await html(example('vinho')));
  });
});
