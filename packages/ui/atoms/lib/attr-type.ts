import {Directive, inject, input, linkedSignal} from '@angular/core';
import {HostAttributes} from '@terseware/ui/internal';
import {PublicWritableSource} from '@terseware/ui/state';

@Directive({
  exportAs: 'attrType',
  host: {
    '[attr.type]': 'toValue()',
  },
})
export class AttrType extends PublicWritableSource<string | null> {
  readonly type = input(inject(HostAttributes).get('type'));
  constructor() {
    super(linkedSignal(() => this.type()));
  }
}
