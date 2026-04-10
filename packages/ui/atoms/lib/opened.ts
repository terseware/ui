import {booleanAttribute, Directive, inject, input, linkedSignal} from '@angular/core';
import {HostAttributes} from '@terseware/ui/internal';
import {State} from '@terseware/ui/state';

/** Reactive open/closed state driving `aria-expanded` and `data-open`/`data-closed`. */
@Directive({
  exportAs: 'opened',
  host: {
    '[attr.data-open]': 'value() ? "" : null',
    '[attr.data-closed]': '!value() ? "" : null',
    '[aria-expanded]': 'value()',
  },
})
export class Opened extends State<boolean> {
  readonly #init = booleanAttribute(inject(HostAttributes).get('aria-expanded'));
  readonly opened = input(this.#init, {transform: booleanAttribute});

  constructor() {
    super(linkedSignal(() => this.opened()));
  }

  override readonly set = super.set.bind(this);
  override readonly link = super.link.bind(this);

  toggle() {
    this.update((state) => !state);
  }
}
