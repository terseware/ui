import {Directive, inject, input, linkedSignal} from '@angular/core';
import {HostAttributes} from '@terseware/ui/internal';
import {TerseRefsState, type TerseRef} from '@terseware/ui/state';

/** Reactive `aria-describedby` — elements whose text describes this one. */
@Directive({
  exportAs: 'ariaDescribedBy',
  host: {
    '[attr.aria-describedby]': 'attr()',
  },
})
export class AriaDescribedBy extends TerseRefsState {
  readonly #init = inject(HostAttributes).get('aria-describedby')?.split(' ');
  readonly ariaDescribedBy = input((this.#init ?? []) as TerseRef[]);

  constructor() {
    super(linkedSignal(() => this.ariaDescribedBy()));
  }
}
