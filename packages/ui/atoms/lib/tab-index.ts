import {Directive, inject, input, linkedSignal, numberAttribute} from '@angular/core';
import {HostAttributes} from '@terseware/ui/internal';
import {ControlledSource} from '@terseware/ui/sources';

@Directive({
  exportAs: 'tabIndex',
  host: {
    '[tabIndex]': 'source()',
  },
})
export class TabIndex extends ControlledSource<number> {
  readonly #init = numberAttribute(inject(HostAttributes).get('tabindex') ?? 0, 0);

  readonly tabIndex = input(this.#init, {
    transform: (v) => numberAttribute(v, this.#init),
  });

  override source = linkedSignal(() => this.tabIndex());
}
