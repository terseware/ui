import {booleanAttribute, computed, Directive, input, linkedSignal} from '@angular/core';
import {
  hasDisabledAttribute,
  injectElement,
  optsBuilder,
  SignalController,
} from '@terseware/ui/internal';

export interface DisableOpts {
  /** Whether the element is disabled by default. */
  initialDisabled: boolean;

  /** Whether the element is disabled interactively by default, allowing it to be focused. */
  initialDisabledInteractive: boolean;
}

const [provideDisableOpts, injectDisableOpts] = optsBuilder<DisableOpts>('Disable', {
  initialDisabled: false,
  initialDisabledInteractive: false,
});

export {provideDisableOpts};

export type DisableState = 'hard' | 'soft' | null;

@Directive({
  exportAs: 'disable',
  host: {
    '[attr.disabled]': 'attrDisabled()',
    '[attr.aria-disabled]': 'ariaDisabledAttr()',
    '[attr.data-disabled]': 'source()',
  },
})
export class Disable extends SignalController<DisableState> {
  readonly #element = injectElement();
  readonly #opts = injectDisableOpts();

  readonly disabled = input(this.#opts.initialDisabled, {
    transform: booleanAttribute,
  });

  readonly disabledInteractive = input(this.#opts.initialDisabledInteractive, {
    transform: booleanAttribute,
  });

  override source = linkedSignal(() =>
    this.disabled() ? (this.disabledInteractive() ? 'soft' : 'hard') : null,
  );

  readonly hard = computed(() => this.source() === 'hard');
  readonly soft = computed(() => this.source() === 'soft');

  protected readonly attrDisabled = computed(() =>
    this.#isNative ? (this.hard() ? '' : null) : null,
  );

  protected readonly ariaDisabledAttr = computed(() => {
    if ((this.#isNative && this.soft()) || (!this.#isNative && this.disabled())) {
      return this.disabled();
    }
    return null;
  });

  get #isNative(): boolean {
    return hasDisabledAttribute(this.#element);
  }
}
