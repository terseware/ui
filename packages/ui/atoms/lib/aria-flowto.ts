import {Directive, inject, input, linkedSignal} from '@angular/core';
import {HostAttributes} from '@terseware/ui/internal';
import {IdsAttribute, type IdRef} from '@terseware/ui/state';

/** Reactive `aria-flowto` — alternate reading-order targets. */
@Directive({
  exportAs: 'ariaFlowTo',
  host: {
    '[attr.aria-flowto]': 'value()',
  },
})
export class AriaFlowTo extends IdsAttribute {
  readonly #init = inject(HostAttributes).get('aria-flowto')?.split(' ');
  readonly ariaFlowTo = input((this.#init ?? []) as IdRef[]);

  constructor() {
    super(linkedSignal(() => this.ariaFlowTo()));
  }
}
