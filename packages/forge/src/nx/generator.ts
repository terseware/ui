import {formatFiles, type Tree} from '@nx/devkit';
import {resolveConfig} from '../config/resolve.js';
import {generateBare} from '../generators/bare.js';
import {generatePreset} from '../generators/preset.js';
import {generateTemplate} from '../generators/template.js';
import type {GenerateOptions} from '../generators/utils.js';
import {loadRegistryComponent} from '../registry/index.js';
import type {ForgeAddSchema} from './schema.js';

export default async function forgeAddGenerator(tree: Tree, schema: ForgeAddSchema): Promise<void> {
  const {config} = resolveConfig(tree.root);
  const registry = loadRegistryComponent(schema.component);

  const genOptions: GenerateOptions = {
    component: schema.component,
    prefix: schema.prefix ?? config.prefix,
    inputs: schema.inputs,
    template: schema.template,
    preset: schema.preset,
    uiPackage: config.uiPackage,
  };

  let output: string;

  if (schema.preset) {
    output = generatePreset(registry, genOptions);
  } else if (schema.template) {
    output = generateTemplate(registry, genOptions);
  } else {
    output = generateBare(registry, genOptions);
  }

  // Determine output path
  const prefix = genOptions.prefix;
  const fileName = `${kebabCase(prefix)}-${schema.component}.ts`;
  const outputPath = `${config.outputDir}/${schema.component}/${fileName}`;

  if (!schema.dryRun) {
    tree.write(outputPath, output);
    await formatFiles(tree);
  } else {
    console.log(`Would write to: ${outputPath}`);
    console.log(output);
  }
}

function kebabCase(s: string): string {
  return s
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}
