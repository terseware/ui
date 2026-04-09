import {Directive, inject, input, linkedSignal, numberAttribute} from '@angular/core';
import {HostAttributes} from '@terseware/ui/internal';
import {PublicSource} from '@terseware/ui/sources';

@Directive({
  exportAs: 'tabIndex',
  host: {
    '[tabIndex]': 'toValue()',
  },
})
export class TabIndex extends PublicSource<number> {
  readonly #init = numberAttribute(inject(HostAttributes).get('tabindex') ?? 0, 0);

  readonly tabIndex = input(this.#init, {
    transform: (v) => numberAttribute(v, this.#init),
  });

  constructor() {
    super(linkedSignal(() => this.tabIndex()));
  }
}
