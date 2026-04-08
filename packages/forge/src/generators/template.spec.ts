import {describe, expect, it} from 'vitest';
import type {RegistryComponent} from '../registry/schema.js';
import {generateTemplate} from './template.js';

const buttonRegistry: RegistryComponent = {
  name: 'button',
  description: 'Button primitive',
  directives: [{type: 'Button', importPath: '@terseware/ui/button'}],
  core: ['Button'],
  optional: [],
  templates: {
    'native-submit': {
      description: 'Native submit button with loading state',
      selector: 'button[{prefix}Button]',
      isComponent: true as const,
      hostBindings: {
        '[aria-label]': "isSubmitting() ? 'Submitting, please wait' : null",
      },
      templateContent:
        '@if (isSubmitting()) {\n      <span>Submitting...</span>\n    } @else {\n      <span>Submit</span>\n    }',
      injects: [
        {type: 'SoftDisabled', importPath: '@terseware/ui/atoms', as: 'isSubmitting'},
        {type: 'AttrType', importPath: '@terseware/ui/atoms'},
      ],
      constructorLogic: "inject(AttrType).set('submit');",
      additionalDirectives: [
        {
          type: 'SoftDisabled',
          importPath: '@terseware/ui/atoms',
          inputs: {softDisabled: 'submitting'},
        },
        {type: 'Button', importPath: '@terseware/ui/button'},
      ],
    },
  },
};

describe('generateTemplate', () => {
  it('generates component with correct selector', () => {
    const result = generateTemplate(buttonRegistry, {
      component: 'button',
      prefix: 'appSubmit',
      template: 'native-submit',
      uiPackage: '@terseware/ui',
    });

    expect(result).toContain("selector: 'button[appSubmitButton]'");
  });

  it('generates class with correct name', () => {
    const result = generateTemplate(buttonRegistry, {
      component: 'button',
      prefix: 'appSubmit',
      template: 'native-submit',
      uiPackage: '@terseware/ui',
    });

    expect(result).toContain('export class AppSubmitButton');
  });

  it('includes host bindings', () => {
    const result = generateTemplate(buttonRegistry, {
      component: 'button',
      prefix: 'appSubmit',
      template: 'native-submit',
      uiPackage: '@terseware/ui',
    });

    expect(result).toContain('[aria-label]');
    expect(result).toContain('Submitting, please wait');
  });

  it('includes inject statements', () => {
    const result = generateTemplate(buttonRegistry, {
      component: 'button',
      prefix: 'appSubmit',
      template: 'native-submit',
      uiPackage: '@terseware/ui',
    });

    expect(result).toContain('readonly isSubmitting = inject(SoftDisabled).asReadonly();');
  });

  it('includes constructor logic', () => {
    const result = generateTemplate(buttonRegistry, {
      component: 'button',
      prefix: 'appSubmit',
      template: 'native-submit',
      uiPackage: '@terseware/ui',
    });

    expect(result).toContain("inject(AttrType).set('submit');");
  });

  it('includes template content', () => {
    const result = generateTemplate(buttonRegistry, {
      component: 'button',
      prefix: 'appSubmit',
      template: 'native-submit',
      uiPackage: '@terseware/ui',
    });

    expect(result).toContain('isSubmitting()');
    expect(result).toContain('Submitting...');
    expect(result).toContain('Submit');
  });

  it('includes hostDirectives from additionalDirectives', () => {
    const result = generateTemplate(buttonRegistry, {
      component: 'button',
      prefix: 'appSubmit',
      template: 'native-submit',
      uiPackage: '@terseware/ui',
    });

    expect(result).toContain('directive: SoftDisabled');
    expect(result).toContain("'softDisabled:submitting'");
    expect(result).toContain('Button,');
  });

  it('throws on unknown template', () => {
    expect(() =>
      generateTemplate(buttonRegistry, {
        component: 'button',
        prefix: 'app',
        template: 'nonexistent',
        uiPackage: '@terseware/ui',
      }),
    ).toThrow('Template "nonexistent" not found');
  });

  it('throws when component has no templates', () => {
    const noTemplates: RegistryComponent = {
      name: 'menu',
      description: 'Menu',
      directives: [],
      core: [],
      optional: [],
    };

    expect(() =>
      generateTemplate(noTemplates, {
        component: 'menu',
        prefix: 'app',
        template: 'anything',
        uiPackage: '@terseware/ui',
      }),
    ).toThrow('Template "anything" not found');
  });
});
