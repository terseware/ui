import {booleanAttribute, computed, Directive, inject, input, linkedSignal} from '@angular/core';
import {hasDisabledAttribute, injectElement} from '@terseware/ui/internal';
import {PublicState} from '@terseware/ui/state';

/** `'hard'` = not focusable, not activatable. `'soft'` = focusable, not activatable. */
export type DisabledState = 'hard' | 'soft' | null;

/** Standalone hard-disabled flag. */
@Directive({
  exportAs: 'hardDisabled',
})
export class HardDisabled extends PublicState<boolean> {
  readonly hardDisabled = input(false, {transform: booleanAttribute});
  constructor() {
    super(linkedSignal(() => this.hardDisabled()));
  }
}

/** Standalone soft-disabled flag. */
@Directive({
  exportAs: 'softDisabled',
})
export class SoftDisabled extends PublicState<boolean> {
  readonly softDisabled = input(false, {transform: booleanAttribute});
  constructor() {
    super(linkedSignal(() => this.softDisabled()));
  }
}

/**
 * Combined disabled state resolving hard/soft flags into the correct native
 * `disabled` and `aria-disabled` attributes for the host element type.
 */
@Directive({
  exportAs: 'disabler',
  hostDirectives: [HardDisabled, SoftDisabled],
  host: {
    '[attr.disabled]': 'attrDisabled()',
    '[attr.aria-disabled]': 'ariaDisabledAttr()',
    '[attr.data-disabled]': 'toValue()',
  },
})
export class Disabled extends PublicState<DisabledState> {
  readonly #element = injectElement();
  readonly #hard = inject(HardDisabled);
  readonly #soft = inject(SoftDisabled);

  constructor() {
    super(
      linkedSignal(() => {
        if (this.#soft()) {
          return 'soft';
        }
        if (this.#hard()) {
          return 'hard';
        }
        return null;
      }),
    );
  }

  readonly disabled = computed(() => !!this.toValue());
  readonly hard = computed(() => this.toValue() === 'hard');
  readonly soft = computed(() => this.toValue() === 'soft');

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

  hardDisable() {
    this.set('hard');
  }

  softDisable() {
    this.set('soft');
  }

  enable() {
    this.set(null);
  }
}
