import {describe, expect, it} from 'vitest';
import type {RegistryComponent} from '../registry/schema.js';
import {generatePreset} from './preset.js';

const buttonRegistry: RegistryComponent = {
  name: 'button',
  description: 'Button primitive',
  directives: [{type: 'Button', importPath: '@terseware/ui/button'}],
  core: ['Button'],
  optional: [],
  presets: ['terse'],
};

describe('generatePreset', () => {
  it('generates component with correct class name and selector', () => {
    const result = generatePreset(buttonRegistry, {
      component: 'button',
      prefix: 'terse',
      preset: 'terse',
      uiPackage: '@terseware/ui',
    });

    expect(result).toContain('export class TerseButton');
    expect(result).toContain("selector: 'terse-button, [terseButton]'");
  });

  it('generates CVA variants const with correct prefix', () => {
    const result = generatePreset(buttonRegistry, {
      component: 'button',
      prefix: 'terse',
      preset: 'terse',
      uiPackage: '@terseware/ui',
    });

    expect(result).toContain('const terseButtonVariants = cva(');
    expect(result).toContain(
      'export type TerseButtonVariants = VariantProps<typeof terseButtonVariants>;',
    );
  });

  it('generates CVA variants call with default fallback', () => {
    const result = generatePreset(buttonRegistry, {
      component: 'button',
      prefix: 'terse',
      preset: 'terse',
      uiPackage: '@terseware/ui',
    });

    expect(result).toContain('inject(TwClasses).variants(terseButtonVariants, () => ({');
    expect(result).toContain("variant: this.terseButton() || 'default',");
    expect(result).toContain('size: this.size(),');
  });

  it('generates all hostDirectives', () => {
    const result = generatePreset(buttonRegistry, {
      component: 'button',
      prefix: 'terse',
      preset: 'terse',
      uiPackage: '@terseware/ui',
    });

    expect(result).toContain('TabIndex');
    expect(result).toContain('HardDisabled');
    expect(result).toContain('SoftDisabled');
    expect(result).toContain('AttrRole');
    expect(result).toContain('AttrType');
    expect(result).toContain('TwClasses');
    expect(result).toContain('Button,');
  });

  it('generates loading state', () => {
    const result = generatePreset(buttonRegistry, {
      component: 'button',
      prefix: 'terse',
      preset: 'terse',
      uiPackage: '@terseware/ui',
    });

    expect(result).toContain('readonly isLoading = inject(SoftDisabled).asReadonly();');
    expect(result).toContain("'[aria-label]': \"isLoading() ? 'Loading, please wait' : null\"");
    expect(result).toContain('isLoading()');
  });

  it('generates correct input signals', () => {
    const result = generatePreset(buttonRegistry, {
      component: 'button',
      prefix: 'terse',
      preset: 'terse',
      uiPackage: '@terseware/ui',
    });

    expect(result).toContain(
      "readonly terseButton = input<TerseButtonVariants['variant'] | ''>('');",
    );
    expect(result).toContain("readonly size = input<TerseButtonVariants['size']>();");
  });

  it('adapts to different prefix', () => {
    const result = generatePreset(buttonRegistry, {
      component: 'button',
      prefix: 'app',
      preset: 'terse',
      uiPackage: '@terseware/ui',
    });

    expect(result).toContain('export class AppButton');
    expect(result).toContain("selector: 'app-button, [appButton]'");
    expect(result).toContain('const appButtonVariants = cva(');
    expect(result).toContain('readonly appButton = input<');
    expect(result).toContain("variant: this.appButton() || 'default'");
  });

  it('respects custom uiPackage', () => {
    const result = generatePreset(buttonRegistry, {
      component: 'button',
      prefix: 'terse',
      preset: 'terse',
      uiPackage: '@myorg/ui',
    });

    expect(result).toContain("from '@myorg/ui/atoms'");
    expect(result).toContain("from '@myorg/ui/button'");
  });

  it('throws on unknown preset', () => {
    expect(() =>
      generatePreset(buttonRegistry, {
        component: 'button',
        prefix: 'terse',
        preset: 'unknown',
        uiPackage: '@terseware/ui',
      }),
    ).toThrow('Preset "unknown" not found');
  });

  it('throws when component has no presets', () => {
    const noPresets: RegistryComponent = {
      name: 'menu',
      description: 'Menu',
      directives: [],
      core: [],
      optional: [],
    };

    expect(() =>
      generatePreset(noPresets, {
        component: 'menu',
        prefix: 'app',
        preset: 'terse',
        uiPackage: '@terseware/ui',
      }),
    ).toThrow('Preset "terse" not found');
  });
});
