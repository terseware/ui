import {booleanAttribute, Directive, input, linkedSignal} from '@angular/core';
import {hostAttr, type UnSet} from '@terseware/ui/internal';
import {pipe, State} from '@terseware/ui/state';
import {AriaExpandedAttr, DataClosedAttr, DataOpenedAttr} from './attr';

@Directive({
  selector: '[role]:not([unterse~="role"]):not([unterse=""])',
  exportAs: 'roleAttr',
  host: {
    '[attr.role]': 'value()',
  },
})
export class Role extends State<string | null> {
  readonly role = input(hostAttr('role'));
  constructor() {
    super(linkedSignal(() => this.role()));
  }
}

@Directive({
  selector: '[type]:not([unterse~="type"]):not([unterse=""])',
  exportAs: 'typeAttr',
  host: {
    '[attr.type]': 'value()',
  },
})
export class Type extends State<string | null> {
  readonly type = input(hostAttr('type'));
  constructor() {
    super(linkedSignal(() => this.type()));
  }
}

const oritentationSet = new Set(['horizontal', 'vertical'] as const);
export type OrientationValue = UnSet<typeof oritentationSet> | null;

@Directive({
  selector: '[orientation]:not([unterse~="orientation"]):not([unterse=""])',
  exportAs: 'orientationAttr',
  host: {
    '[attr.aria-orientation]': 'value()',
  },
})
export class Orientation extends State<OrientationValue> {
  readonly orientation = input(hostAttr('aria-orientation') as OrientationValue);
  constructor() {
    super(
      linkedSignal(() => this.orientation()),
      (s) => (s && oritentationSet.has(s) ? s : null),
    );
  }
}

@Directive({
  selector: '[opened]:not([unterse~="opened"]):not([unterse=""])',
  exportAs: 'opened',
  hostDirectives: [DataOpenedAttr, DataClosedAttr, AriaExpandedAttr],
})
export class Opened extends State<boolean> {
  override readonly set = super.set.bind(this);
  readonly toggle = () => super.update((u) => !u);
  readonly opened = input(false, {transform: booleanAttribute});
  constructor() {
    super(linkedSignal(() => this.opened()));
    pipe(DataOpenedAttr, () => (this.value() ? '' : null));
    pipe(DataClosedAttr, () => (!this.value() ? '' : null));
    pipe(AriaExpandedAttr, () => String(this.value()));
  }
}
