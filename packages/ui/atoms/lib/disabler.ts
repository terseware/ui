import {booleanAttribute, computed, Directive, inject, input, linkedSignal} from '@angular/core';
import {hasDisabledAttribute, injectElement} from '@terseware/ui/internal';
import {PublicSource, Source} from '@terseware/ui/sources';

export type DisabledState = 'hard' | 'soft' | null;

@Directive({
  exportAs: 'hardDisabled',
})
export class HardDisabled extends PublicSource<boolean> {
  readonly hardDisabled = input(false, {transform: booleanAttribute});
  constructor() {
    super(linkedSignal(() => this.hardDisabled()));
  }
}

@Directive({
  exportAs: 'softDisabled',
})
export class SoftDisabled extends PublicSource<boolean> {
  readonly softDisabled = input(false, {transform: booleanAttribute});
  constructor() {
    super(linkedSignal(() => this.softDisabled()));
  }
}

@Directive({
  exportAs: 'disabler',
  hostDirectives: [HardDisabled, SoftDisabled],
  host: {
    '[attr.disabled]': 'attrDisabled()',
    '[attr.aria-disabled]': 'ariaDisabledAttr()',
    '[attr.data-disabled]': 'toValue()',
  },
})
export class Disabled extends Source<DisabledState> {
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
