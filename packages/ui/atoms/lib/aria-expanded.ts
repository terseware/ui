import {booleanAttribute, Directive, inject, input, linkedSignal} from '@angular/core';
import {HostAttributes} from '@terseware/ui/internal';
import {ControlledSource} from '@terseware/ui/sources';

@Directive({
  exportAs: 'ariaExpanded',
  host: {
    '[aria-expanded]': 'source()',
  },
})
export class AriaExpanded extends ControlledSource<boolean> {
  readonly #init = booleanAttribute(inject(HostAttributes).get('aria-expanded'));
  readonly ariaExpanded = input(this.#init, {transform: booleanAttribute});
  override source = linkedSignal(() => this.ariaExpanded());
}
