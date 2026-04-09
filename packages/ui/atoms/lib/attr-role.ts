import {Directive, inject, input, linkedSignal} from '@angular/core';
import {HostAttributes} from '@terseware/ui/internal';
import {PublicSource} from '@terseware/ui/sources';

@Directive({
  exportAs: 'attrRole',
  host: {
    '[attr.role]': 'toValue()',
  },
})
export class AttrRole extends PublicSource<string | null> {
  readonly role = input(inject(HostAttributes).get('role'));
  constructor() {
    super(linkedSignal(() => this.role()));
  }
}
