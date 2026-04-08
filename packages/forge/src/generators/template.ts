import type {RegistryComponent, RegistryTemplate} from '../registry/schema.js';
import {
  buildClassName,
  collectImports,
  formatHostDirective,
  formatImports,
  type GenerateOptions,
} from './utils.js';

/**
 * Mode 2: Generate a component from a named template.
 *
 * Templates define host bindings, template content, injects, and constructor logic.
 * The output is a full @Component with hostDirectives.
 */
export function generateTemplate(registry: RegistryComponent, options: GenerateOptions): string {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const templateName = options.template!;
  const template = registry.templates?.[templateName];
  if (!template) {
    const available = Object.keys(registry.templates ?? {}).join(', ');
    throw new Error(
      `Template "${templateName}" not found for component "${registry.name}". Available: ${available || 'none'}`,
    );
  }

  const className = buildClassName(options.prefix, options.component);
  const selector = resolveSelector(template.selector, options.prefix);

  // Use the template's additional directives (they define exactly what this component needs)
  const directives = template.additionalDirectives ?? [];

  // Collect imports
  const importMap = collectImports(directives, options.uiPackage);
  importMap.set('@angular/core', new Set(['Component', 'inject']));

  // Add inject imports
  for (const inj of template.injects ?? []) {
    const path = inj.importPath.replace('@terseware/ui', options.uiPackage);
    const existing = importMap.get(path);
    if (existing) {
      existing.add(inj.type);
    } else {
      importMap.set(path, new Set([inj.type]));
    }
  }

  const importStatements = formatImports(importMap);

  // Build hostDirectives
  const hostDirectiveEntries = directives.map((d) => formatHostDirective(d)).join(',\n    ');

  // Build host bindings
  const hostBindings = template.hostBindings ? formatHostObject(template.hostBindings) : '';

  // Build class body
  const classBody = buildClassBody(template);

  return `${importStatements}

@Component({
  selector: '${selector}',
  hostDirectives: [
    ${hostDirectiveEntries},
  ],${hostBindings}
  template: \`
    ${template.templateContent}
  \`,
})
export class ${className} {
${classBody}}
`;
}

function resolveSelector(pattern: string, prefix: string): string {
  return pattern.replace(/{prefix}/g, prefix);
}

function formatHostObject(bindings: Record<string, string>): string {
  const entries = Object.entries(bindings)
    .map(([key, value]) => `    '${key}': "${value}"`)
    .join(',\n');
  return `\n  host: {\n${entries},\n  },`;
}

function buildClassBody(template: RegistryTemplate): string {
  const lines: string[] = [];

  // Readonly signal fields from injects
  for (const inj of template.injects ?? []) {
    if (inj.as) {
      lines.push(`  readonly ${inj.as} = inject(${inj.type}).asReadonly();`);
    }
  }

  // Constructor logic
  if (template.constructorLogic) {
    lines.push('');
    lines.push('  constructor() {');
    lines.push(`    ${template.constructorLogic}`);
    lines.push('  }');
  }

  if (lines.length > 0) {
    return lines.join('\n') + '\n';
  }
  return '';
}
