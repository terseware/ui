import {
  booleanAttribute,
  computed,
  Directive,
  forwardRef,
  inject,
  input,
  linkedSignal,
  numberAttribute,
} from '@angular/core';
import {listener} from '@signality/core';
import {hasDisabledAttribute, hostAttr, injectElement} from '@terseware/ui/internal';
import {pipe, State} from '@terseware/ui/state';
import {AriaDisabledAttr, DataDisabledAttr, DisabledAttr} from './attr';

@Directive({
  selector: '[tabIndex]:not([unterse~="tabIndex"]):not([unterse=""])',
  exportAs: 'tabIndex',
  host: {
    '[tabIndex]': 'value()',
  },
})
export class TabIndex extends State<number | null> {
  readonly #init = numberAttribute(hostAttr('tabindex'), 0);
  readonly tabIndex = input(this.#init, {transform: (v) => numberAttribute(v, this.#init)});
  constructor() {
    super(linkedSignal(() => this.tabIndex()));
  }
}

@Directive({
  selector: '[disabled]:not([unterse~="disabled"]):not([unterse=""])',
  exportAs: 'disabled',
  hostDirectives: [TabIndex, DisabledAttr, DataDisabledAttr, AriaDisabledAttr],
  host: {
    '(keydown)': 'onKeyDown($event)',
  },
})
export class Disabled extends State<boolean> {
  readonly #element = injectElement();
  readonly #softDisabled = inject(
    forwardRef(() => SoftDisabled),
    {optional: true, self: true},
  )?.asReadonly();

  readonly variant = computed(() => (this.#softDisabled?.() ? 'soft' : this() ? 'hard' : null));
  readonly soft = computed(() => this.variant() === 'soft');
  readonly hard = computed(() => this.variant() === 'hard');

  readonly disabledInput = input(false, {transform: booleanAttribute, alias: 'disabled'});
  constructor() {
    super(linkedSignal(() => this.#softDisabled?.() || this.disabledInput()));

    pipe(DisabledAttr, (disabledAttr) => (this.soft() ? false : this() ? true : disabledAttr));
    pipe(DataDisabledAttr, (dataDisabled) => (this.variant() ? this.variant() : dataDisabled));

    pipe(TabIndex, (tabIndex) => {
      if (!hasDisabledAttribute(this.#element) && this()) {
        tabIndex = this.soft() ? tabIndex : -1;
      }
      return tabIndex;
    });

    pipe(AriaDisabledAttr, (ariaDisabled) => {
      if ((this.#native && this.soft()) || (!this.#native && this())) {
        return String(this());
      }
      return ariaDisabled;
    });

    listener.capture(this.#element, 'click', (event) => {
      if (this()) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    });
  }

  get #native(): boolean {
    return hasDisabledAttribute(this.#element);
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (this.soft() && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
    }
  }
}

@Directive({
  selector: '[softDisabled]:not([unterse~="softDisabled"]):not([unterse=""])',
  exportAs: 'softDisabled',
  hostDirectives: [Disabled],
})
export class SoftDisabled extends State<boolean> {
  readonly softDisabled = input(false, {transform: booleanAttribute});
  constructor() {
    super(linkedSignal(() => this.softDisabled()));
  }
}
