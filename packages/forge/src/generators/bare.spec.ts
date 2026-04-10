import {describe, expect, it} from 'vitest';
import type {RegistryComponent} from '../registry/schema.js';
import {generateBare} from './bare.js';

const buttonRegistry: RegistryComponent = {
  name: 'button',
  description: 'Button primitive',
  directives: [
    {type: 'Button', importPath: '@terseware/ui/button'},
    {type: 'HardDisabled', importPath: '@terseware/ui/atoms', inputs: {hardDisabled: 'disabled'}},
    {type: 'SoftDisabled', importPath: '@terseware/ui/atoms', inputs: {softDisabled: 'loading'}},
  ],
  core: ['Button'],
  optional: ['HardDisabled', 'SoftDisabled'],
};

describe('generateBare', () => {
  it('generates directive with only core directives when no inputs specified', () => {
    const result = generateBare(buttonRegistry, {
      component: 'button',
      prefix: 'app',
      uiPackage: '@terseware/ui',
    });

    expect(result).toContain('export class AppButton {}');
    expect(result).toContain("selector: '[appButton]'");
    expect(result).toContain('Button,');
    expect(result).not.toContain('HardDisabled');
    expect(result).not.toContain('SoftDisabled');
  });

  it('includes optional directives when matching inputs are specified', () => {
    const result = generateBare(buttonRegistry, {
      component: 'button',
      prefix: 'app',
      inputs: ['hardDisabled:disabled'],
      uiPackage: '@terseware/ui',
    });

    expect(result).toContain('HardDisabled');
    expect(result).toContain("'hardDisabled:disabled'");
    expect(result).not.toContain('SoftDisabled');
  });

  it('includes multiple optional directives', () => {
    const result = generateBare(buttonRegistry, {
      component: 'button',
      prefix: 'app',
      inputs: ['hardDisabled:disabled', 'softDisabled:loading'],
      uiPackage: '@terseware/ui',
    });

    expect(result).toContain('HardDisabled');
    expect(result).toContain('SoftDisabled');
  });

  it('applies custom prefix to selector and class name', () => {
    const result = generateBare(buttonRegistry, {
      component: 'button',
      prefix: 'myApp',
      uiPackage: '@terseware/ui',
    });

    expect(result).toContain("selector: '[myAppButton]'");
    expect(result).toContain('export class MyAppButton {}');
  });

  it('handles kebab-case component names', () => {
    const registry: RegistryComponent = {
      name: 'menu-trigger',
      description: 'Menu trigger',
      directives: [{type: 'MenuTrigger', importPath: '@terseware/ui/menu'}],
      core: ['MenuTrigger'],
      optional: [],
    };

    const result = generateBare(registry, {
      component: 'menu-trigger',
      prefix: 'app',
      inputs: ['menuTriggerFor:appMenuTrigger'],
      uiPackage: '@terseware/ui',
    });

    expect(result).toContain("selector: '[appMenuTrigger]'");
    expect(result).toContain('export class AppMenuTrigger {}');
    expect(result).toContain("'menuTriggerFor:appMenuTrigger'");
  });

  it('applies custom input alias overrides', () => {
    const result = generateBare(buttonRegistry, {
      component: 'button',
      prefix: 'app',
      inputs: ['hardDisabled:isOff'],
      uiPackage: '@terseware/ui',
    });

    expect(result).toContain("'hardDisabled:isOff'");
  });

  it('generates correct Angular imports', () => {
    const result = generateBare(buttonRegistry, {
      component: 'button',
      prefix: 'app',
      uiPackage: '@terseware/ui',
    });

    expect(result).toContain("import {Button} from '@terseware/ui/button';");
    expect(result).toContain("import {Directive} from '@angular/core';");
  });

  it('respects custom uiPackage', () => {
    const result = generateBare(buttonRegistry, {
      component: 'button',
      prefix: 'app',
      uiPackage: '@myorg/ui',
    });

    expect(result).toContain("from '@myorg/ui/button'");
  });
});
