import {Directive, inject, input, linkedSignal} from '@angular/core';
import {HostAttributes} from '@terseware/ui/internal';
import {TerseRefsState, type TerseRef} from '@terseware/ui/state';

/** Reactive `aria-labelledby` — elements whose text content labels this one. */
@Directive({
  exportAs: 'ariaLabelledBy',
  host: {
    '[attr.aria-labelledby]': 'attr()',
  },
})
export class AriaLabelledBy extends TerseRefsState {
  readonly #init = inject(HostAttributes).get('aria-labelledby')?.split(' ');
  readonly ariaLabelledBy = input((this.#init ?? []) as TerseRef[]);

  constructor() {
    super(linkedSignal(() => this.ariaLabelledBy()));
  }
}
