import {Directive, inject, input, linkedSignal} from '@angular/core';
import {HostAttributes, optsBuilder, SignalController} from '@terseware/ui/internal';

export interface AttrRoleOpts {
  initialRole: string | null;
}

const [provideAttrRoleOpts, injectAttrRoleOpts] = optsBuilder<AttrRoleOpts>('AttrRole', () => ({
  initialRole: inject(HostAttributes).get('role'),
}));

export {provideAttrRoleOpts};

@Directive({
  exportAs: 'attrRole',
  host: {
    '[attr.role]': 'source()',
  },
})
export class AttrRole extends SignalController<string | null> {
  readonly role = input(injectAttrRoleOpts().initialRole);
  override source = linkedSignal(() => this.role());
}
