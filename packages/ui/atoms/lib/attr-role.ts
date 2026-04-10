import {Directive, inject, input, linkedSignal} from '@angular/core';
import {HostAttributes} from '@terseware/ui/internal';
import {State} from '@terseware/ui/state';

/** Reactive `role` attribute. */
@Directive({
  exportAs: 'attrRole',
  host: {
    '[attr.role]': 'value()',
  },
})
export class AttrRole extends State<string | null> {
  readonly role = input(inject(HostAttributes).get('role'));

  constructor() {
    super(linkedSignal(() => this.role()));
  }

  override readonly set = super.set.bind(this);
  override readonly link = super.link.bind(this);
}
