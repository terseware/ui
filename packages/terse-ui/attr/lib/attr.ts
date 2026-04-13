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
  readonly attrValue = computed(() => numberAttribute(this.result(), 0));
  constructor() {
    super(
      linkedSignal(() => this.tabIndex()),
      {transform: (v) => (isNull(v) ? null : numberAttribute(v, 0))},
    );
  }
}

@Directive({
  exportAs: 'disabled',
  host: {'[attr.disabled]': 'attrValue()'},
})
export class Disabled extends StatePipeline<boolean> {
  readonly #native = hasDisabledAttribute(injectElement());
  readonly attrValue = computed(() => (this.result() ? '' : null));
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
  readonly attrValue = computed(() => (isBoolean(this.result()) ? String(this.result()) : null));
  constructor() {
    super(null, {transform: (v) => (AriaDisabled.set.has(String(v)) ? Boolean(v) : null)});
  }
}

@Directive({
  exportAs: 'role',
  host: {'[attr.role]': 'result()'},
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
  host: {'[attr.type]': 'result()'},
})
export class Type extends StatePipeline<string | null> {
  readonly #host = inject(new HostAttributeToken('type'), {optional: true});
  readonly type = input(this.#host);
  constructor() {
    super(linkedSignal(() => this.type()));
  }
}

// Data attributes

export abstract class DataAttribute extends StatePipeline<string | number | boolean | null> {
  readonly attrValue = computed(() => {
    const result = this.result();
    return isBoolean(result) ? (result ? '' : null) : result;
  });
  constructor() {
    super(null);
  }
}

@Directive({
  exportAs: 'dataDisabled',
  host: {'[attr.data-disabled]': 'attrValue()'},
})
export class DataDisabled extends DataAttribute {}

@Directive({
  exportAs: 'dataFocus',
  host: {'[attr.data-focus]': 'attrValue()'},
})
export class DataFocus extends DataAttribute {}

@Directive({
  exportAs: 'dataFocusVisible',
  host: {'[attr.data-focus-visible]': 'attrValue()'},
})
export class DataFocusVisible extends DataAttribute {}

@Directive({
  exportAs: 'dataHover',
  host: {'[attr.data-hover]': 'attrValue()'},
})
export class DataHover extends DataAttribute {}
