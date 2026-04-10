import {Directive, inject, input, linkedSignal} from '@angular/core';
import {HostAttributes} from '@terseware/ui/internal';
import {IdsAttribute, type IdRef} from '@terseware/ui/state';

/** Reactive `aria-describedby` — elements whose text describes this one. */
@Directive({
  exportAs: 'ariaDescribedBy',
  host: {
    '[attr.aria-describedby]': 'value()',
  },
})
export class AriaDescribedBy extends IdsAttribute {
  readonly #init = inject(HostAttributes).get('aria-describedby')?.split(' ');
  readonly ariaDescribedBy = input((this.#init ?? []) as IdRef[]);

  constructor() {
    super(linkedSignal(() => this.ariaDescribedBy()));
  }
}
