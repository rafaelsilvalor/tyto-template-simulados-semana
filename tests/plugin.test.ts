import { readFileSync } from 'node:fs';

import { PLUGIN_API_VERSION, satisfiesEngine } from '@tyto/plugin-api';
import { testPlugin } from '@tyto/plugin-api/testing';
import { afterAll, describe, expect, it } from 'vitest';

import type { PluginHarness } from '@tyto/plugin-api/testing';

/**
 * The built bundle, loaded the way Tyto loads an installed plugin (Tyto ADR 0150): the
 * manifest checked as `tyto plugin install` checks it, against the contract installed here,
 * and `dist/index.js` activated through the same `tryActivate`. Run after `pnpm build`.
 */

const manifest = readFileSync(new URL('../tyto-plugin.json', import.meta.url), 'utf8');

// A URL rather than a literal path: the bundle has no types, and the test loads it as data.
const entry = new URL('../dist/index.js', import.meta.url).href;

const opened = await testPlugin({ manifest, load: () => import(entry) });
if (!opened.ok) throw new Error(opened.error.map((item) => item.message).join('\n'));
const harness: PluginHarness = opened.value;
afterAll(() => harness.close());

describe('the plugin', () => {
  it('declares an engine the contract it is built against satisfies', () => {
    expect(satisfiesEngine(JSON.parse(manifest).engine, PLUGIN_API_VERSION)).toBe(true);
  });

  it('asks for CircularXX, the licensed face it measures, and nothing else', () => {
    expect(harness.manifest.permissions).toEqual(['font:CircularXX']);
  });

  it('registers one pack, read from templates/, that draws its templates itself', () => {
    const packs = harness.host.registry.templatePacks();

    expect(packs.map((pack) => [pack.id, pack.directory])).toEqual([
      ['simulados-semana', 'templates'],
    ]);
    expect(typeof packs[0]?.build).toBe('function');
  });
});
