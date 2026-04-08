#!/usr/bin/env node
import {Command} from 'commander';
import {runAdd} from './commands/add.js';
import {runInit} from './commands/init.js';
import {listRegistryComponents} from './registry/index.js';

const program = new Command();

program
  .name('terse')
  .description('@terseware/forge — generate UI component wrappers from @terseware/ui primitives')
  .version('0.0.1');

const forge = program.command('forge').description('Scaffold and compose UI components');

forge
  .command('init')
  .description('Initialize terse.json configuration')
  .option('-p, --prefix <prefix>', 'Component prefix (e.g., app)')
  .option('-o, --output-dir <dir>', 'Output directory for generated components')
  .option('-s, --style <style>', 'Styling approach: none | tailwind')
  .action(async (opts) => {
    await runInit({
      cwd: process.cwd(),
      prefix: opts.prefix as string | undefined,
      outputDir: opts.outputDir as string | undefined,
      style: opts.style as 'none' | 'tailwind' | undefined,
    });
  });

forge
  .command('add <component>')
  .description('Generate a component wrapper')
  .option('-p, --prefix <prefix>', 'Override prefix from terse.json')
  .option('-i, --inputs <mappings...>', 'Input mappings (e.g., hardDisabled:disabled)')
  .option('-t, --template <name>', 'Use a named template (Mode 2)')
  .option('--preset <name>', 'Use a named preset (Mode 3)')
  .option('--dry-run', 'Preview generated output without writing files')
  .action(async (component: string, opts) => {
    await runAdd({
      component,
      cwd: process.cwd(),
      prefix: opts.prefix as string | undefined,
      inputs: opts.inputs as string[] | undefined,
      template: opts.template as string | undefined,
      preset: opts.preset as string | undefined,
      dryRun: opts.dryRun as boolean | undefined,
    });
  });

forge
  .command('list')
  .description('List available components')
  .action(() => {
    const components = listRegistryComponents();
    if (components.length === 0) {
      console.log('No components available.');
      return;
    }
    console.log('Available components:');
    for (const name of components) {
      console.log(`  - ${name}`);
    }
  });

program.parse();
