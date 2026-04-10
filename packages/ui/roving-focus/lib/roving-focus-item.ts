import {Directive, inject} from '@angular/core';
import {Disabled, TerseId} from '@terseware/ui/atoms';
import {Focused} from '@terseware/ui/atoms/interactions';
import {Interactive} from '@terseware/ui/interactive';
import {injectElement} from '@terseware/ui/internal';

@Directive({
  exportAs: 'rovingFocusItem',
  hostDirectives: [Interactive, TerseId, Focused],
})
export class RovingFocusItem {
  readonly #interactive = inject(Interactive);
  readonly element = injectElement();
  readonly id = inject(TerseId);
  readonly hardDisabled = inject(Disabled).hard;
  readonly softDisabled = inject(Disabled).soft;

  readonly #focused = inject(Focused);
  readonly isActive = this.#focused.select((c) => c.focused);

  constructor() {
    this.#interactive.tabIndex.bindTo((x) => (this.isActive() ? x : -1));
  }

  focus() {
    this.#focused.focus();
  }

  blur() {
    this.#focused.blur();
  }
}
