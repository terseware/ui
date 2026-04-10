import {describe, expect, it} from 'vitest';
import {listRegistryComponents, loadRegistryComponent} from './index.js';

describe('loadRegistryComponent', () => {
  it('loads button component from registry', () => {
    const button = loadRegistryComponent('button');
    expect(button.name).toBe('button');
    expect(button.core).toContain('Button');
    expect(button.directives.length).toBeGreaterThan(0);
  });

  it('loads menu-trigger component', () => {
    const trigger = loadRegistryComponent('menu-trigger');
    expect(trigger.name).toBe('menu-trigger');
    expect(trigger.core).toContain('MenuTrigger');
  });

  it('returns cached instance on second call', () => {
    const first = loadRegistryComponent('button');
    const second = loadRegistryComponent('button');
    expect(first).toBe(second);
  });

  it('throws on unknown component', () => {
    expect(() => loadRegistryComponent('nonexistent')).toThrow('Unknown component "nonexistent"');
  });

  it('validates registry schema', () => {
    const button = loadRegistryComponent('button');
    expect(button.name).toBeTypeOf('string');
    expect(button.description).toBeTypeOf('string');
    expect(Array.isArray(button.directives)).toBe(true);
    expect(Array.isArray(button.core)).toBe(true);
    expect(Array.isArray(button.optional)).toBe(true);
  });

  it('loads button with templates', () => {
    const button = loadRegistryComponent('button');
    expect(button.templates).toBeDefined();
    expect(button.templates?.['native-submit']).toBeDefined();
  });

  it('loads button with presets', () => {
    const button = loadRegistryComponent('button');
    expect(button.presets).toContain('terse');
  });
});

describe('listRegistryComponents', () => {
  it('returns all registered components', () => {
    const components = listRegistryComponents();
    expect(components).toContain('button');
    expect(components).toContain('menu');
    expect(components).toContain('menu-trigger');
    expect(components).toContain('menu-item');
  });

  it('returns component names without .json extension', () => {
    const components = listRegistryComponents();
    for (const name of components) {
      expect(name).not.toContain('.json');
    }
  });
});
