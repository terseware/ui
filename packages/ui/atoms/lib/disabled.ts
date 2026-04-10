import {booleanAttribute, computed, Directive, input, linkedSignal} from '@angular/core';
import {hasDisabledAttribute, injectElement} from '@terseware/ui/internal';
import {State} from '@terseware/ui/state';

/** `'hard'` = not focusable, not activatable. `'soft'` = focusable, not activatable. */
export type DisabledState = 'hard' | 'soft' | null;

/**
 * Combined disabled state resolving hard/soft flags into the correct native
 * `disabled` and `aria-disabled` attributes for the host element type.
 */
@Directive({
  exportAs: 'terseDisabled',
  host: {
    '[attr.disabled]': 'attrDisabled()',
    '[attr.aria-disabled]': 'ariaDisabledAttr()',
    '[attr.data-disabled]': 'value()',
  },
})
export class Disabled extends State<DisabledState> {
  readonly #element = injectElement();
  readonly hardDisabledInput = input(false, {transform: booleanAttribute, alias: 'hardDisabled'});
  readonly softDisabledInput = input(false, {transform: booleanAttribute, alias: 'softDisabled'});

  constructor() {
    super(
      linkedSignal(() => {
        if (this.softDisabledInput()) {
          return 'soft';
        }
        if (this.hardDisabledInput()) {
          return 'hard';
        }
        return null;
      }),
    );
  }

  readonly isDisabled = computed(() => !!this.value());
  readonly isHardDisabled = computed(() => this.value() === 'hard');
  readonly isSoftDisabled = computed(() => this.value() === 'soft');

  protected readonly attrDisabled = computed(() =>
    this.#isNative ? (this.isHardDisabled() ? '' : null) : null,
  );

  protected readonly ariaDisabledAttr = computed(() => {
    if ((this.#isNative && this.isSoftDisabled()) || (!this.#isNative && this.isDisabled())) {
      return this.isDisabled();
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

  override readonly link = super.link.bind(this);
}
