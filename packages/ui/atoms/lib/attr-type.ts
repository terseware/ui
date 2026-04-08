import {Directive, inject, input, linkedSignal} from '@angular/core';
import {HostAttributes} from '@terseware/ui/internal';
import {ControlledSource} from '@terseware/ui/sources';

@Directive({
  exportAs: 'attrType',
  host: {
    '[attr.type]': 'source()',
  },
})
export class AttrType extends ControlledSource<string | null> {
  readonly type = input(inject(HostAttributes).get('type'));
  override source = linkedSignal(() => this.type());
}
