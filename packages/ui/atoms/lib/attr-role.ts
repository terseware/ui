import {Directive, inject, input, linkedSignal} from '@angular/core';
import {HostAttributes} from '@terseware/ui/internal';
import {PublicState} from '@terseware/ui/state';

@Directive({
  exportAs: 'attrRole',
  host: {
    '[attr.role]': 'toValue()',
  },
})
export class AttrRole extends PublicState<string | null> {
  readonly role = input(inject(HostAttributes).get('role'));
  constructor() {
    super(linkedSignal(() => this.role()));
  }
}
