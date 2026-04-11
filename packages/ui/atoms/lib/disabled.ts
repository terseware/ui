import {
  booleanAttribute,
  computed,
  Directive,
  input,
  linkedSignal,
  numberAttribute,
} from '@angular/core';
import {listener} from '@signality/core';
import {hasDisabledAttribute, hostAttr, injectElement} from '@terseware/ui/internal';
import {pipe, State} from '@terseware/ui/state';
import {AriaDisabled, DataDisabled, Disabled} from './attr';

@Directive({
  selector: '[tabIndex]:not([unterse-tabIndex]):not([unterse])',
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

/**
 * Unified disabled-state directive. Accepts both `disabled` (hard) and
 * `softDisabled` (soft — focusable, click-blocked, aria-disabled) inputs
 * on a single instance so downstream composition does not have to juggle
 * two directives that reference each other via `forwardRef`.
 *
 * Variant resolution: `softDisabled` wins over `disabled`, so an element
 * that is both hard- and soft-disabled renders as soft (focusable,
 * aria-disabled) rather than being pulled out of the tab order.
 */
@Directive({
  selector: '[disabled]:not([unterse-disabled]):not([unterse])',
  exportAs: 'disabler',
  hostDirectives: [TabIndex, Disabled, DataDisabled, AriaDisabled],
  host: {
    '(keydown)': 'onKeyDown($event)',
  },
})
export class Disabler extends State<boolean> {
  readonly #element = injectElement();

  readonly disabledInput = input(false, {transform: booleanAttribute, alias: 'disabled'});
  readonly softDisabledInput = input(false, {
    transform: booleanAttribute,
    alias: 'softDisabled',
  });

  readonly variant = computed(() =>
    this.softDisabledInput() ? 'soft' : this.disabledInput() ? 'hard' : null,
  );
  readonly soft = computed(() => this.variant() === 'soft');
  readonly hard = computed(() => this.variant() === 'hard');

  constructor() {
    super(linkedSignal(() => this.softDisabledInput() || this.disabledInput()));

    pipe(Disabled, (disabled) => (this.soft() ? false : this() ? true : disabled));
    pipe(DataDisabled, (dataDisabled) => (this.variant() ? this.variant() : dataDisabled));

    pipe(TabIndex, (tabIndex) => {
      if (!hasDisabledAttribute(this.#element) && this()) {
        tabIndex = this.soft() ? tabIndex : -1;
      }
      return tabIndex;
    });

    pipe(AriaDisabled, (ariaDisabled) => {
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
