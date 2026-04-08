import type {RegistryComponent} from '../registry/schema.js';
import {buildClassName, type GenerateOptions} from './utils.js';

/**
 * Mode 3: Generate a fully styled component from a named preset.
 *
 * Each preset is a dedicated builder function that produces a complete component file
 * with CVA variants, host directives, icons, and loading states.
 */
export function generatePreset(registry: RegistryComponent, options: GenerateOptions): string {
  const presetName = options.preset!;
  const available = registry.presets ?? [];

  if (!available.includes(presetName)) {
    throw new Error(
      `Preset "${presetName}" not found for component "${registry.name}". Available: ${available.join(', ') || 'none'}`,
    );
  }

  const builder = presetBuilders[`${registry.name}:${presetName}`];
  if (!builder) {
    throw new Error(`No builder implemented for preset "${registry.name}:${presetName}"`);
  }

  return builder(options);
}

// --- Preset Builders ---

type PresetBuilder = (options: GenerateOptions) => string;

const presetBuilders: Record<string, PresetBuilder> = {
  'button:terse': buildTerseButton,
};

function buildTerseButton(options: GenerateOptions): string {
  const className = buildClassName(options.prefix, options.component);
  const selector = `${options.prefix}-button, [${camelCase(options.prefix)}Button]`;
  const inputName = camelCase(options.prefix) + 'Button';
  const ui = options.uiPackage;

  return `import {Component, inject, input} from '@angular/core';
import {AttrRole, AttrType, HardDisabled, SoftDisabled, TabIndex, TwClasses} from '${ui}/atoms';
import {Button} from '${ui}/button';
import {cva, type VariantProps} from 'class-variance-authority';

const ${camelCase(options.prefix)}ButtonVariants = cva(
  'group/button inline-flex shrink-0 items-center justify-center rounded-4xl border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_ng-icon]:pointer-events-none [&_ng-icon]:shrink-0 [&_ng-icon:not(--ng-icon__size)]:size-4',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/80',
        outline:
          'border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:bg-transparent dark:hover:bg-input/30',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
        ghost:
          'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50',
        destructive:
          'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default:
          'h-9 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5',
        xs: 'h-6 gap-1 px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_ng-icon:not(--ng-icon__size)]:size-3',
        sm: 'h-8 gap-1 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        lg: 'h-10 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3',
        icon: 'size-9',
        'icon-xs': 'size-6 [&_ng-icon:not(--ng-icon__size)]:size-3',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export type ${className}Variants = VariantProps<typeof ${camelCase(options.prefix)}ButtonVariants>;

@Component({
  selector: '${selector}',
  hostDirectives: [
    {
      directive: TabIndex,
      inputs: ['tabIndex'],
    },
    {
      directive: HardDisabled,
      inputs: ['hardDisabled:disabled'],
    },
    {
      directive: SoftDisabled,
      inputs: ['softDisabled:loading'],
    },
    {
      directive: AttrRole,
      inputs: ['role'],
    },
    {
      directive: AttrType,
      inputs: ['type'],
    },
    {
      directive: TwClasses,
      inputs: ['class'],
    },
    Button,
  ],
  host: {
    'data-slot': 'button',
    '[aria-label]': "isLoading() ? 'Loading, please wait' : null",
  },
  template: \`
    @if (isLoading()) {
      <span class="animate-spin">⟳</span>
    }
    <ng-content />
  \`,
})
export class ${className} {
  readonly isLoading = inject(SoftDisabled).asReadonly();
  readonly ${inputName} = input<${className}Variants['variant'] | ''>('');
  readonly size = input<${className}Variants['size']>();

  constructor() {
    inject(TwClasses).variants(${camelCase(options.prefix)}ButtonVariants, () => ({
      variant: this.${inputName}() || 'default',
      size: this.size(),
    }));
  }
}
`;
}

function camelCase(s: string): string {
  const pascal = s
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}
