import {Directive, inject, input, linkedSignal} from '@angular/core';
import {HostAttributes} from '@terseware/ui/internal';
import {TerseRefsState, type TerseRef} from '@terseware/ui/state';

/** Reactive `aria-flowto` — alternate reading-order targets. */
@Directive({
  exportAs: 'ariaFlowTo',
  host: {
    '[attr.aria-flowto]': 'attr()',
  },
})
export class AriaFlowTo extends TerseRefsState {
  readonly #init = inject(HostAttributes).get('aria-flowto')?.split(' ');
  readonly ariaFlowTo = input((this.#init ?? []) as TerseRef[]);

  constructor() {
    super(linkedSignal(() => this.ariaFlowTo()));
  }
}
