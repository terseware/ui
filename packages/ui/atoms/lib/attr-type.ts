import {Directive, inject, input, linkedSignal} from '@angular/core';
import {HostAttributes, SignalController} from '@terseware/ui/internal';

@Directive({
  exportAs: 'attrType',
  host: {
    '[attr.type]': 'value()',
  },
})
export class AttrType extends SignalController<string | null> {
  readonly type = input(inject(HostAttributes).get('type'));
  override source = linkedSignal(() => this.type());
}
