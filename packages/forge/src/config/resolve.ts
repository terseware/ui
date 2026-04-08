import {existsSync, readFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {type TerseConfig, terseConfigSchema} from './schema.js';

/**
 * Walk up from `cwd` to find `terse.json` and parse it.
 */
export function resolveConfig(cwd: string = process.cwd()): {
  config: TerseConfig;
  configPath: string;
} {
  const configPath = findConfigFile(cwd);
  if (!configPath) {
    throw new Error('Could not find terse.json. Run `terse forge init` to create one.');
  }

  const raw = JSON.parse(readFileSync(configPath, 'utf-8')) as unknown;
  const config = terseConfigSchema.parse(raw);
  return {config, configPath};
}

function findConfigFile(from: string): string | null {
  let dir = resolve(from);

  while (true) {
    const candidate = join(dir, 'terse.json');
    if (existsSync(candidate)) {
      return candidate;
    }
    const parent = dirname(dir);
    if (parent === dir) {
      return null;
    }
    dir = parent;
  }
}
