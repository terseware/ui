import {Directive, inject, input, linkedSignal} from '@angular/core';
import {HostAttributes} from '@terseware/ui/internal';
import {PublicSource} from '@terseware/ui/sources';

@Directive({
  exportAs: 'attrType',
  host: {
    '[attr.type]': 'toValue()',
  },
})
export class AttrType extends PublicSource<string | null> {
  readonly type = input(inject(HostAttributes).get('type'));
  constructor() {
    super(linkedSignal(() => this.type()));
  }
}
