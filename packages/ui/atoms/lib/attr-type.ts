import {Directive, inject, input, linkedSignal} from '@angular/core';
import {HostAttributes} from '@terseware/ui/internal';
import {State} from '@terseware/ui/state';

/** Reactive `type` attribute. */
@Directive({
  exportAs: 'attrType',
  host: {
    '[attr.type]': 'value()',
  },
})
export class AttrType extends State<string | null> {
  readonly type = input(inject(HostAttributes).get('type'));

  constructor() {
    super(linkedSignal(() => this.type()));
  }

  override readonly set = super.set.bind(this);
  override readonly link = super.link.bind(this);
}
