import {booleanAttribute, Directive, inject, input, linkedSignal} from '@angular/core';
import {HostAttributes} from '@terseware/ui/internal';
import {PublicState} from '@terseware/ui/state';

/** Reactive open/closed state driving `aria-expanded` and `data-open`/`data-closed`. */
@Directive({
  exportAs: 'openClose',
  host: {
    '[attr.data-open]': 'toValue() ? "" : null',
    '[attr.data-closed]': '!toValue() ? "" : null',
    '[aria-expanded]': 'toValue()',
  },
})
export class OpenClose extends PublicState<boolean> {
  readonly #init = booleanAttribute(inject(HostAttributes).get('aria-expanded'));
  readonly openClose = input(this.#init, {transform: booleanAttribute});

  constructor() {
    super(linkedSignal(() => this.openClose()));
  }
}
