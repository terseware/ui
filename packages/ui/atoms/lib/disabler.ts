import {booleanAttribute, computed, Directive, inject, input, linkedSignal} from '@angular/core';
import {hasDisabledAttribute, injectElement} from '@terseware/ui/internal';
import {ControlledSource} from '@terseware/ui/sources';

export type DisablerState = 'hard' | 'soft' | null;

@Directive({
  exportAs: 'hardDisable',
})
export class HardDisabled extends ControlledSource<boolean> {
  readonly hardDisabled = input(false, {transform: booleanAttribute});
  override source = linkedSignal(() => this.hardDisabled());
}

@Directive({
  exportAs: 'softDisabled',
})
export class SoftDisabled extends ControlledSource<boolean> {
  readonly softDisabled = input(false, {transform: booleanAttribute});
  override source = linkedSignal(() => this.softDisabled());
}

@Directive({
  exportAs: 'disabler',
  hostDirectives: [HardDisabled, SoftDisabled],
  host: {
    '[attr.disabled]': 'attrDisabled()',
    '[attr.aria-disabled]': 'ariaDisabledAttr()',
    '[attr.data-disabled]': 'source()',
  },
})
export class Disabler extends ControlledSource<DisablerState> {
  readonly #element = injectElement();
  readonly #hard = inject(HardDisabled);
  readonly #soft = inject(SoftDisabled);

  override source = linkedSignal(() => {
    if (this.#soft()) {
      return 'soft';
    }
    if (this.#hard()) {
      return 'hard';
    }
    return null;
  });

  readonly disabled = computed(() => !!this.source());
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
