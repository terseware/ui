import {Directive, inject, input, linkedSignal} from '@angular/core';
import {HostAttributes} from '@terseware/ui/internal';
import {PublicState} from '@terseware/ui/state';

const valueList = ['menu', 'listbox', 'tree', 'grid', 'dialog'] as const;
export type AriaHasPopupValues = (typeof valueList)[number];
const set = new Set(valueList) as ReadonlySet<AriaHasPopupValues>;

@Directive({
  exportAs: 'ariaHasPopup',
  host: {
    '[aria-haspopup]': 'toValue()',
  },
})
export class AriaHasPopup extends PublicState<AriaHasPopupValues | null> {
  readonly #init = inject(HostAttributes).get('aria-haspopup') as AriaHasPopupValues;
  readonly ariaHasPopup = input<AriaHasPopupValues | null>(set.has(this.#init) ? this.#init : null);

  constructor() {
    super(linkedSignal(() => this.ariaHasPopup()));
  }
}
