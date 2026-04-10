import {Directive, inject, input, linkedSignal, numberAttribute} from '@angular/core';
import {HostAttributes} from '@terseware/ui/internal';
import {PublicWritableSource} from '@terseware/ui/state';

@Directive({
  exportAs: 'tabIndex',
  host: {
    '[tabIndex]': 'toValue()',
  },
})
export class TabIndex extends PublicWritableSource<number> {
  readonly #init = numberAttribute(inject(HostAttributes).get('tabindex') ?? 0, 0);

  readonly tabIndex = input(this.#init, {
    transform: (v) => numberAttribute(v, this.#init),
  });

  constructor() {
    super(linkedSignal(() => this.tabIndex()));
  }
}
