import {Directive, inject, input, linkedSignal} from '@angular/core';
import {HostAttributes} from '@terseware/ui/internal';
import {IdsAttribute, type IdRef} from '@terseware/ui/state';

/** Reactive `aria-owns` — a11y-level child refs outside the DOM subtree. */
@Directive({
  exportAs: 'ariaOwns',
  host: {
    '[attr.aria-owns]': 'value()',
  },
})
export class AriaOwns extends IdsAttribute {
  readonly #init = inject(HostAttributes).get('aria-owns')?.split(' ');
  readonly ariaOwns = input((this.#init ?? []) as IdRef[]);

  constructor() {
    super(linkedSignal(() => this.ariaOwns()));
  }
}
