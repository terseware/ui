import type {RegistryDirective} from '../registry/schema.js';

export interface FileWriter {
  write(path: string, content: string): void;
  exists(path: string): boolean;
}

export interface GenerateOptions {
  /** Component name from registry: "button", "menu-trigger" */
  component: string;
  /** Directive/component class prefix: "app", "terse" */
  prefix: string;
  /** User-specified input mappings: ["hardDisabled:disabled"] */
  inputs?: string[] | undefined;
  /** Template name for Mode 2 */
  template?: string | undefined;
  /** Preset name for Mode 3 */
  preset?: string | undefined;
  /** @terseware/ui package name */
  uiPackage: string;
}

/**
 * Build a PascalCase class name: "app" + "button" -> "AppButton"
 */
export function buildClassName(prefix: string, component: string): string {
  return pascalCase(prefix) + pascalCase(component);
}

/**
 * Build a camelCase selector: "app" + "button" -> "appButton"
 */
export function buildSelector(prefix: string, component: string): string {
  return camelCase(prefix) + pascalCase(component);
}

/**
 * Collect unique imports from a list of directives.
 * Returns: Map<importPath, Set<typeName>>
 */
export function collectImports(
  directives: RegistryDirective[],
  uiPackage: string,
): Map<string, Set<string>> {
  const imports = new Map<string, Set<string>>();

  for (const d of directives) {
    const path = d.importPath.replace('@terseware/ui', uiPackage);
    const existing = imports.get(path);
    if (existing) {
      existing.add(d.type);
    } else {
      imports.set(path, new Set([d.type]));
    }
  }

  return imports;
}

/**
 * Format import statements from a collected import map.
 */
export function formatImports(importMap: Map<string, Set<string>>): string {
  return Array.from(importMap.entries())
    .map(([path, types]) => {
      const sorted = Array.from(types).sort();
      return `import {${sorted.join(', ')}} from '${path}';`;
    })
    .join('\n');
}

/**
 * Build a hostDirectives array entry string.
 */
export function formatHostDirective(
  directive: RegistryDirective,
  inputOverrides?: Map<string, string>,
): string {
  const inputs = directive.inputs ?? {};
  const resolvedInputs = new Map<string, string>();

  for (const [inputName, defaultAlias] of Object.entries(inputs)) {
    const alias = inputOverrides?.get(inputName) ?? defaultAlias;
    resolvedInputs.set(inputName, alias);
  }

  if (resolvedInputs.size === 0) {
    return directive.type;
  }

  const inputEntries = Array.from(resolvedInputs.entries())
    .map(([input, alias]) => `'${input}:${alias}'`)
    .join(', ');

  return `{\n      directive: ${directive.type},\n      inputs: [${inputEntries}],\n    }`;
}

/**
 * Parse user --inputs flag: "hardDisabled:disabled,softDisabled:loading"
 * Returns Map<inputName, alias>
 */
export function parseInputMappings(inputs: string[]): Map<string, string> {
  const result = new Map<string, string>();
  for (const mapping of inputs) {
    for (const pair of mapping.split(',')) {
      const [input, alias] = pair.trim().split(':');
      if (input && alias) {
        result.set(input, alias);
      }
    }
  }
  return result;
}

function pascalCase(s: string): string {
  return s
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

function camelCase(s: string): string {
  const pascal = pascalCase(s);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}
