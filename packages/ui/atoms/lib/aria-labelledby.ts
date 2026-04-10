import {Directive, inject, input, linkedSignal} from '@angular/core';
import {HostAttributes} from '@terseware/ui/internal';
import {IdsAttribute, type IdRef} from '@terseware/ui/state';

/** Reactive `aria-labelledby` — elements whose text content labels this one. */
@Directive({
  exportAs: 'ariaLabelledBy',
  host: {
    '[attr.aria-labelledby]': 'value()',
  },
})
export class AriaLabelledBy extends IdsAttribute {
  readonly #init = inject(HostAttributes).get('aria-labelledby')?.split(' ');
  readonly ariaLabelledBy = input((this.#init ?? []) as IdRef[]);

  constructor() {
    super(linkedSignal(() => this.ariaLabelledBy()));
  }
}
