import {Directive, inject, input, linkedSignal} from '@angular/core';
import {HostAttributes} from '@terseware/ui/internal';
import {ControlledSource} from '@terseware/ui/sources';

@Directive({
  exportAs: 'attrRole',
  host: {
    '[attr.role]': 'source()',
  },
})
export class AttrRole extends ControlledSource<string | null> {
  readonly role = input(inject(HostAttributes).get('role'));
  override source = linkedSignal(() => this.role());
}
