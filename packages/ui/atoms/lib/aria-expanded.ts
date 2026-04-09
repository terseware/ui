import {booleanAttribute, Directive, inject, input, linkedSignal} from '@angular/core';
import {HostAttributes} from '@terseware/ui/internal';
import {PublicSource} from '@terseware/ui/sources';

@Directive({
  exportAs: 'ariaExpanded',
  host: {
    '[aria-expanded]': 'toValue()',
  },
})
export class AriaExpanded extends PublicSource<boolean> {
  readonly #init = booleanAttribute(inject(HostAttributes).get('aria-expanded'));
  readonly ariaExpanded = input(this.#init, {transform: booleanAttribute});

  constructor() {
    super(linkedSignal(() => this.ariaExpanded()));
  }
}
