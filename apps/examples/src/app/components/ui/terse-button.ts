import {Component, inject, input} from '@angular/core';
import {AttrRole, AttrType, Disabled, TabIndex, TwClasses} from '@terseware/ui/atoms';
import {Button} from '@terseware/ui/button';
import {cva, type VariantProps} from 'class-variance-authority';

const terseButtonVariants = cva(
  "group/button focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-3 active:not-aria-[haspopup]:translate-y-px aria-invalid:ring-3 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/80',
        outline:
          'border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 shadow-xs',
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
          'h-9 gap-1.5 px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),8px)] px-2 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: 'h-8 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5',
        lg: 'h-10 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        icon: 'size-9',
        'icon-xs':
          "size-6 rounded-[min(var(--radius-md),8px)] in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-3",
        'icon-sm':
          'size-8 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-md',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export type TerseButtonVariants = VariantProps<typeof terseButtonVariants>;

@Component({
  selector: 'terse-button, [terseButton]',
  hostDirectives: [
    {
      directive: TabIndex,
      inputs: ['tabIndex'],
    },
    {
      directive: Disabled,
      inputs: ['hardDisabled:disabled', 'softDisabled:loading'],
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
    '[attr.data-variant]': 'terseButton()',
    '[attr.data-size]': 'buttonSize()',
    '[aria-label]': "isLoading() ? 'Loading, please wait' : null",
  },
  template: `
    @if (isLoading()) {
      <span class="animate-spin"></span>
    }
    <ng-content />
  `,
})
export class TerseButton {
  readonly isLoading = inject(Disabled).select((d) => d === 'soft');
  readonly terseButton = input<TerseButtonVariants['variant'] | ''>('');
  readonly buttonSize = input<TerseButtonVariants['size']>();

  constructor() {
    inject(TwClasses).variants(terseButtonVariants, () => ({
      variant: this.terseButton() || 'default',
      size: this.buttonSize(),
    }));
  }
}
