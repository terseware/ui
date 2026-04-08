import {existsSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import pc from 'picocolors';
import type {TerseConfig} from '../config/schema.js';

export interface InitOptions {
  cwd: string;
  prefix?: string | undefined;
  outputDir?: string | undefined;
  style?: 'none' | 'tailwind' | undefined;
}

export async function runInit(options: InitOptions): Promise<void> {
  const configPath = join(options.cwd, 'terse.json');

  if (existsSync(configPath)) {
    console.log(pc.yellow('terse.json already exists. Skipping init.'));
    return;
  }

  // Detect Angular project
  const isAngular =
    existsSync(join(options.cwd, 'angular.json')) || existsSync(join(options.cwd, 'project.json'));

  if (!isAngular) {
    console.log(pc.yellow('Warning: No angular.json or project.json found. Proceeding anyway.'));
  }

  let prefix = options.prefix;
  let outputDir = options.outputDir;
  let style = options.style;

  // If options not provided, use interactive prompts
  if (!prefix || !outputDir || !style) {
    const {default: Enquirer} = await import('enquirer');
    const enquirer = new Enquirer();

    if (!prefix) {
      const response = (await enquirer.prompt({
        type: 'input',
        name: 'prefix',
        message: 'Component prefix',
        initial: 'app',
      })) as {prefix: string};
      prefix = response.prefix;
    }

    if (!outputDir) {
      const response = (await enquirer.prompt({
        type: 'input',
        name: 'outputDir',
        message: 'Output directory for generated components',
        initial: 'src/components/ui',
      })) as {outputDir: string};
      outputDir = response.outputDir;
    }

    if (!style) {
      const response = (await enquirer.prompt({
        type: 'select',
        name: 'style',
        message: 'Styling approach',
        choices: ['none', 'tailwind'],
      })) as {style: string};
      style = response.style as 'none' | 'tailwind';
    }
  }

  const config: TerseConfig = {
    $schema: 'https://terseware.com/schema/terse.json',
    prefix: prefix!,
    outputDir: outputDir!,
    uiPackage: '@terseware/ui',
    style: style!,
  };

  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');

  console.log('');
  console.log(pc.green('✓') + ' Created terse.json');
  console.log('');
  console.log('Next steps:');
  console.log(`  ${pc.cyan('terse forge add button')}  — generate a button wrapper`);
  console.log(`  ${pc.cyan('terse forge add button --preset terse')}  — generate a styled button`);
}
