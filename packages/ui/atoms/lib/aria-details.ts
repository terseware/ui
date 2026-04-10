import {Directive, inject, input, linkedSignal} from '@angular/core';
import {HostAttributes} from '@terseware/ui/internal';
import {IdsAttribute, type IdRef} from '@terseware/ui/state';

/** Reactive `aria-details` — structured extended-description refs. */
@Directive({
  exportAs: 'ariaDetails',
  host: {
    '[attr.aria-details]': 'value()',
  },
})
export class AriaDetails extends IdsAttribute {
  readonly #init = inject(HostAttributes).get('aria-details')?.split(' ');
  readonly ariaDetails = input((this.#init ?? []) as IdRef[]);

  constructor() {
    super(linkedSignal(() => this.ariaDetails()));
  }
}
