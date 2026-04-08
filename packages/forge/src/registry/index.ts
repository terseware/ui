import {readdirSync, readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {type RegistryComponent, registryComponentSchema} from './schema.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMPONENTS_DIR = join(__dirname, 'components');

const cache = new Map<string, RegistryComponent>();

export function loadRegistryComponent(name: string): RegistryComponent {
  const cached = cache.get(name);
  if (cached) return cached;

  const filePath = join(COMPONENTS_DIR, `${name}.json`);
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(filePath, 'utf-8')) as unknown;
  } catch {
    throw new Error(`Unknown component "${name}". No registry entry found at ${filePath}`);
  }

  const component = registryComponentSchema.parse(raw);
  cache.set(name, component);
  return component;
}

export function listRegistryComponents(): string[] {
  try {
    return readdirSync(COMPONENTS_DIR)
      .filter((f) => f.endsWith('.json') && !f.endsWith('.schema.json'))
      .map((f) => f.replace('.json', ''));
  } catch {
    return [];
  }
}
