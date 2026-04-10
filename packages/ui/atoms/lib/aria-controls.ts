import {Directive, inject, input, linkedSignal} from '@angular/core';
import {HostAttributes} from '@terseware/ui/internal';
import {TerseRefsState, type TerseRef} from '@terseware/ui/state';

/** Reactive `aria-controls` — elements this element controls. */
@Directive({
  exportAs: 'ariaControls',
  host: {
    '[attr.aria-controls]': 'attr()',
  },
})
export class AriaControls extends TerseRefsState {
  readonly #init = inject(HostAttributes).get('aria-controls')?.split(' ');
  readonly ariaControls = input((this.#init ?? []) as TerseRef[]);

  constructor() {
    super(linkedSignal(() => this.ariaControls()));
  }
}
