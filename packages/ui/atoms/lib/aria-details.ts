import {Directive, inject, input, linkedSignal} from '@angular/core';
import {HostAttributes} from '@terseware/ui/internal';
import {TerseRefsState, type TerseRef} from '@terseware/ui/state';

/** Reactive `aria-details` — structured extended-description refs. */
@Directive({
  exportAs: 'ariaDetails',
  host: {
    '[attr.aria-details]': 'attr()',
  },
})
export class AriaDetails extends TerseRefsState {
  readonly #init = inject(HostAttributes).get('aria-details')?.split(' ');
  readonly ariaDetails = input((this.#init ?? []) as TerseRef[]);

  constructor() {
    super(linkedSignal(() => this.ariaDetails()));
  }
}
