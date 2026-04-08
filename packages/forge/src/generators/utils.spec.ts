import {describe, expect, it} from 'vitest';
import {
  buildClassName,
  buildSelector,
  collectImports,
  formatHostDirective,
  formatImports,
  parseInputMappings,
} from './utils.js';

describe('buildClassName', () => {
  it('combines prefix and component in PascalCase', () => {
    expect(buildClassName('app', 'button')).toBe('AppButton');
  });

  it('handles kebab-case components', () => {
    expect(buildClassName('app', 'menu-trigger')).toBe('AppMenuTrigger');
  });

  it('handles multi-word prefix', () => {
    expect(buildClassName('app-submit', 'button')).toBe('AppSubmitButton');
  });
});

describe('buildSelector', () => {
  it('combines prefix (camelCase) and component (PascalCase)', () => {
    expect(buildSelector('app', 'button')).toBe('appButton');
  });

  it('handles kebab-case components', () => {
    expect(buildSelector('app', 'menu-trigger')).toBe('appMenuTrigger');
  });
});

describe('parseInputMappings', () => {
  it('parses single mapping', () => {
    const result = parseInputMappings(['hardDisabled:disabled']);
    expect(result.get('hardDisabled')).toBe('disabled');
    expect(result.size).toBe(1);
  });

  it('parses comma-separated mappings', () => {
    const result = parseInputMappings(['hardDisabled:disabled,softDisabled:loading']);
    expect(result.get('hardDisabled')).toBe('disabled');
    expect(result.get('softDisabled')).toBe('loading');
  });

  it('parses multiple flag values', () => {
    const result = parseInputMappings(['hardDisabled:disabled', 'softDisabled:loading']);
    expect(result.size).toBe(2);
  });

  it('ignores malformed entries', () => {
    const result = parseInputMappings(['noColon', 'valid:mapping']);
    expect(result.size).toBe(1);
    expect(result.get('valid')).toBe('mapping');
  });

  it('returns empty map for empty input', () => {
    expect(parseInputMappings([]).size).toBe(0);
  });
});

describe('collectImports', () => {
  it('groups directives by import path', () => {
    const result = collectImports(
      [
        {type: 'HardDisabled', importPath: '@terseware/ui/atoms'},
        {type: 'SoftDisabled', importPath: '@terseware/ui/atoms'},
        {type: 'Button', importPath: '@terseware/ui/button'},
      ],
      '@terseware/ui',
    );
    expect(result.get('@terseware/ui/atoms')).toEqual(new Set(['HardDisabled', 'SoftDisabled']));
    expect(result.get('@terseware/ui/button')).toEqual(new Set(['Button']));
  });

  it('replaces uiPackage in import paths', () => {
    const result = collectImports(
      [{type: 'Button', importPath: '@terseware/ui/button'}],
      '@custom/ui',
    );
    expect(result.has('@custom/ui/button')).toBe(true);
  });
});

describe('formatImports', () => {
  it('formats import map as import statements', () => {
    const map = new Map<string, Set<string>>([
      ['@terseware/ui/atoms', new Set(['HardDisabled', 'SoftDisabled'])],
    ]);
    expect(formatImports(map)).toBe(
      "import {HardDisabled, SoftDisabled} from '@terseware/ui/atoms';",
    );
  });

  it('sorts types alphabetically', () => {
    const map = new Map<string, Set<string>>([
      ['@terseware/ui/atoms', new Set(['SoftDisabled', 'AttrRole', 'HardDisabled'])],
    ]);
    const result = formatImports(map);
    expect(result).toContain('AttrRole, HardDisabled, SoftDisabled');
  });
});

describe('formatHostDirective', () => {
  it('returns bare type name when no inputs', () => {
    expect(formatHostDirective({type: 'Button', importPath: '@terseware/ui/button'})).toBe(
      'Button',
    );
  });

  it('formats directive with inputs', () => {
    const result = formatHostDirective({
      type: 'HardDisabled',
      importPath: '@terseware/ui/atoms',
      inputs: {hardDisabled: 'disabled'},
    });
    expect(result).toContain('directive: HardDisabled');
    expect(result).toContain("'hardDisabled:disabled'");
  });

  it('applies input overrides', () => {
    const overrides = new Map([['hardDisabled', 'isDisabled']]);
    const result = formatHostDirective(
      {type: 'HardDisabled', importPath: '@terseware/ui/atoms', inputs: {hardDisabled: 'disabled'}},
      overrides,
    );
    expect(result).toContain("'hardDisabled:isDisabled'");
  });
});
