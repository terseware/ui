import {Directive, inject, input, linkedSignal, numberAttribute} from '@angular/core';
import {HostAttributes} from '@terseware/ui/internal';
import {State} from '@terseware/ui/state';

/** Reactive `tabindex` attribute. */
@Directive({
  exportAs: 'tabIndex',
  host: {
    '[tabIndex]': 'value()',
  },
})
export class TabIndex extends State<number> {
  readonly #init = numberAttribute(inject(HostAttributes).get('tabindex') ?? 0, 0);

  readonly tabIndex = input(this.#init, {
    transform: (v) => numberAttribute(v, this.#init),
  });

  constructor() {
    super(linkedSignal(() => this.tabIndex()));
  }

  override readonly set = super.set.bind(this);
  override readonly link = super.link.bind(this);
}
