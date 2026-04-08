import {existsSync, mkdirSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {resolveConfig} from './resolve.js';
import {terseConfigSchema} from './schema.js';

describe('terseConfigSchema', () => {
  it('parses full config', () => {
    const result = terseConfigSchema.parse({
      prefix: 'app',
      outputDir: 'src/ui',
      uiPackage: '@terseware/ui',
      style: 'tailwind',
    });

    expect(result.prefix).toBe('app');
    expect(result.outputDir).toBe('src/ui');
    expect(result.style).toBe('tailwind');
  });

  it('applies defaults for missing fields', () => {
    const result = terseConfigSchema.parse({});
    expect(result.prefix).toBe('app');
    expect(result.outputDir).toBe('src/components/ui');
    expect(result.uiPackage).toBe('@terseware/ui');
    expect(result.style).toBe('none');
  });

  it('rejects invalid style', () => {
    expect(() => terseConfigSchema.parse({style: 'scss'})).toThrow();
  });

  it('rejects empty prefix', () => {
    expect(() => terseConfigSchema.parse({prefix: ''})).toThrow();
  });
});

describe('resolveConfig', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `forge-test-${Date.now()}`);
    mkdirSync(testDir, {recursive: true});
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, {recursive: true});
    }
  });

  it('finds and parses terse.json in cwd', () => {
    writeFileSync(
      join(testDir, 'terse.json'),
      JSON.stringify({prefix: 'test', outputDir: 'src/gen', style: 'none'}),
    );

    const {config, configPath} = resolveConfig(testDir);
    expect(config.prefix).toBe('test');
    expect(config.outputDir).toBe('src/gen');
    expect(configPath).toBe(join(testDir, 'terse.json'));
  });

  it('walks up directories to find terse.json', () => {
    const subDir = join(testDir, 'sub', 'deep');
    mkdirSync(subDir, {recursive: true});
    writeFileSync(join(testDir, 'terse.json'), JSON.stringify({prefix: 'root'}));

    const {config} = resolveConfig(subDir);
    expect(config.prefix).toBe('root');
  });

  it('throws when no terse.json found', () => {
    expect(() => resolveConfig(testDir)).toThrow('Could not find terse.json');
  });

  it('applies schema defaults', () => {
    writeFileSync(join(testDir, 'terse.json'), JSON.stringify({}));

    const {config} = resolveConfig(testDir);
    expect(config.prefix).toBe('app');
    expect(config.uiPackage).toBe('@terseware/ui');
  });
});
