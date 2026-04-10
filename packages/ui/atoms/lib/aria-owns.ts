import {Directive, inject, input, linkedSignal} from '@angular/core';
import {HostAttributes} from '@terseware/ui/internal';
import {TerseRefsState, type TerseRef} from '@terseware/ui/state';

/** Reactive `aria-owns` — a11y-level child refs outside the DOM subtree. */
@Directive({
  exportAs: 'ariaOwns',
  host: {
    '[attr.aria-owns]': 'attr()',
  },
})
export class AriaOwns extends TerseRefsState {
  readonly #init = inject(HostAttributes).get('aria-owns')?.split(' ');
  readonly ariaOwns = input((this.#init ?? []) as TerseRef[]);

  constructor() {
    super(linkedSignal(() => this.ariaOwns()));
  }
}
