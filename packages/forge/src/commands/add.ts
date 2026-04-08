import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import pc from 'picocolors';
import {resolveConfig} from '../config/resolve.js';
import {generateBare} from '../generators/bare.js';
import {generatePreset} from '../generators/preset.js';
import {generateTemplate} from '../generators/template.js';
import type {GenerateOptions} from '../generators/utils.js';
import {loadRegistryComponent} from '../registry/index.js';

export interface AddOptions {
  component: string;
  cwd: string;
  prefix?: string | undefined;
  inputs?: string[] | undefined;
  template?: string | undefined;
  preset?: string | undefined;
  dryRun?: boolean | undefined;
}

export async function runAdd(options: AddOptions): Promise<void> {
  // Load config
  const {config, configPath} = resolveConfig(options.cwd);
  const configDir = dirname(configPath);

  // Load registry
  const registry = loadRegistryComponent(options.component);

  // Build generate options
  const genOptions: GenerateOptions = {
    component: options.component,
    prefix: options.prefix ?? config.prefix,
    inputs: options.inputs,
    template: options.template,
    preset: options.preset,
    uiPackage: config.uiPackage,
  };

  // Determine mode and generate
  let output: string;
  let mode: string;

  if (options.preset) {
    output = generatePreset(registry, genOptions);
    mode = `preset:${options.preset}`;
  } else if (options.template) {
    output = generateTemplate(registry, genOptions);
    mode = `template:${options.template}`;
  } else {
    output = generateBare(registry, genOptions);
    mode = 'bare';
  }

  // Determine output file path
  const prefix = genOptions.prefix;
  const fileName = `${kebabCase(prefix)}-${options.component}.ts`;
  const outputPath = join(configDir, config.outputDir, options.component, fileName);

  if (options.dryRun) {
    console.log(pc.cyan('--- dry run ---'));
    console.log(pc.dim(`Would write to: ${outputPath}`));
    console.log('');
    console.log(output);
    return;
  }

  // Check for existing file
  if (existsSync(outputPath)) {
    const {default: Enquirer} = await import('enquirer');
    const enquirer = new Enquirer();
    const response = (await enquirer.prompt({
      type: 'confirm',
      name: 'overwrite',
      message: `${outputPath} already exists. Overwrite?`,
      initial: false,
    })) as {overwrite: boolean};
    if (!response.overwrite) {
      console.log(pc.yellow('Skipped.'));
      return;
    }
  }

  // Write file
  mkdirSync(dirname(outputPath), {recursive: true});
  writeFileSync(outputPath, output);

  console.log(
    pc.green('✓') + ` Generated ${pc.bold(options.component)} (${mode}) → ${pc.dim(outputPath)}`,
  );
}

function kebabCase(s: string): string {
  return s
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}
