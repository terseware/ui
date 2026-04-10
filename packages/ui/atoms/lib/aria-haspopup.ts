import {Directive, inject, input, linkedSignal} from '@angular/core';
import {HostAttributes} from '@terseware/ui/internal';
import {State} from '@terseware/ui/state';

const valueList = ['menu', 'listbox', 'tree', 'grid', 'dialog'] as const;
/** Valid `aria-haspopup` token. */
export type AriaHasPopupValues = (typeof valueList)[number];
const set = new Set(valueList) as ReadonlySet<AriaHasPopupValues>;

/** Reactive `aria-haspopup` — declares the kind of popup this element opens. */
@Directive({
  exportAs: 'ariaHasPopup',
  host: {
    '[aria-haspopup]': 'value()',
  },
})
export class AriaHasPopup extends State<AriaHasPopupValues | null> {
  readonly #init = inject(HostAttributes).get('aria-haspopup') as AriaHasPopupValues;
  readonly ariaHasPopup = input<AriaHasPopupValues | null>(set.has(this.#init) ? this.#init : null);

  constructor() {
    super(linkedSignal(() => this.ariaHasPopup()));
  }

  override readonly set = super.set.bind(this);
  override readonly link = super.link.bind(this);
}
