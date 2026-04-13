import {
  computed,
  Directive,
  HostAttributeToken,
  inject,
  input,
  linkedSignal,
  numberAttribute,
} from '@angular/core';
import {
  hasDisabledAttribute,
  injectElement,
  isBoolean,
  isNull,
  StatePipeline,
} from '@terse-ui/core/utils';

@Directive({
  exportAs: 'tabIndex',
  host: {'[attr.tabindex]': 'attrValue()'},
})
export class TabIndex extends StatePipeline<number | null> {
  readonly #host = inject(new HostAttributeToken('tabindex'), {optional: true});
  readonly #init = isNull(this.#host) ? null : numberAttribute(this.#host, 0);
  readonly tabIndex = input(this.#init, {transform: (v) => numberAttribute(v, 0)});
  readonly attrValue = computed(() => numberAttribute(this.state(), 0));
  constructor() {
    super(linkedSignal(() => this.tabIndex()));
  }
}

@Directive({
  exportAs: 'disabled',
  host: {'[attr.disabled]': 'attrValue()'},
})
export class Disabled extends StatePipeline<boolean> {
  readonly #native = hasDisabledAttribute(injectElement());
  readonly attrValue = computed(() => (this.state() ? '' : null));
  constructor() {
    super(false, {transform: (v) => (this.#native ? v : false)});
  }
}

@Directive({
  exportAs: 'ariaDisabled',
  host: {'[aria-disabled]': 'attrValue()'},
})
export class AriaDisabled extends StatePipeline<'true' | 'false' | boolean | null, boolean | null> {
  private static readonly set = new Set(['true', 'false']);
  readonly attrValue = computed(() => (isBoolean(this.state()) ? String(this.state()) : null));
  constructor() {
    super(null, {transform: (v) => (AriaDisabled.set.has(String(v)) ? Boolean(v) : null)});
  }
}

@Directive({
  exportAs: 'dataDisabled',
  host: {'[attr.data-disabled]': 'attrValue()'},
})
export class DataDisabled extends StatePipeline<boolean | string> {
  readonly attrValue = computed(() =>
    isBoolean(this.state()) ? (this.state() ? '' : null) : this.state(),
  );
  constructor() {
    super(false);
  }
}

@Directive({
  exportAs: 'role',
  host: {'[attr.role]': 'state()'},
})
export class Role extends StatePipeline<string | null> {
  readonly #host = inject(new HostAttributeToken('role'), {optional: true});
  readonly role = input(this.#host);
  constructor() {
    super(linkedSignal(() => this.role()));
  }
}

@Directive({
  exportAs: 'type',
  host: {'[attr.type]': 'state()'},
})
export class Type extends StatePipeline<string | null> {
  readonly #host = inject(new HostAttributeToken('type'), {optional: true});
  readonly type = input(this.#host);
  constructor() {
    super(linkedSignal(() => this.type()));
  }
}
