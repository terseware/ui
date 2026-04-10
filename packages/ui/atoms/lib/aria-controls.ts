import {Directive, input, linkedSignal} from '@angular/core';
import {IdsAttribute} from '@terseware/ui/state';

/** Reactive `aria-controls` — elements this element controls. */
@Directive({
  selector: '[aria-controls]',
  exportAs: 'ariaControls',
  host: {
    '[attr.aria-controls]': 'value()',
  },
})
export class AriaControls extends IdsAttribute {
  readonly ariaControls = input(this.hostValue('aria-controls'), {
    alias: 'aria-controls',
    transform: this.toIdRefs.bind(this),
  });

  constructor() {
    super(linkedSignal(() => this.ariaControls()));
  }
}
