import type {RegistryComponent} from '../registry/schema.js';
import {
  buildClassName,
  buildSelector,
  collectImports,
  formatHostDirective,
  formatImports,
  type GenerateOptions,
  parseInputMappings,
} from './utils.js';

/**
 * Mode 1: Generate a bare wrapper directive.
 *
 * Output example:
 * ```ts
 * @Directive({
 *   selector: '[appButton]',
 *   hostDirectives: [
 *     Button,
 *     { directive: HardDisabled, inputs: ['hardDisabled:disabled'] },
 *   ],
 * })
 * export class AppButton {}
 * ```
 */
export function generateBare(registry: RegistryComponent, options: GenerateOptions): string {
  const inputOverrides = parseInputMappings(options.inputs ?? []);

  // Determine which directives to include:
  // - All core directives always
  // - Optional directives only if user specified an input for them
  const directives = registry.directives.filter((d) => {
    if (registry.core.includes(d.type)) return true;

    // Include optional directive if user mapped any of its inputs
    if (d.inputs) {
      return Object.keys(d.inputs).some((input) => inputOverrides.has(input));
    }
    return false;
  });

  const className = buildClassName(options.prefix, options.component);
  const selector = buildSelector(options.prefix, options.component);

  // Collect and format imports
  const importMap = collectImports(directives, options.uiPackage);
  importMap.set('@angular/core', new Set(['Directive']));
  const importStatements = formatImports(importMap);

  // Build hostDirectives entries
  const hostDirectiveEntries = directives
    .map((d) => formatHostDirective(d, inputOverrides))
    .join(',\n    ');

  return `${importStatements}

@Directive({
  selector: '[${selector}]',
  hostDirectives: [
    ${hostDirectiveEntries},
  ],
})
export class ${className} {}
`;
}
