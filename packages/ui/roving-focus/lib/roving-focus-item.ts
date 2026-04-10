import {Directive, inject} from '@angular/core';
import {Activatable} from '@terseware/ui/activatable';
import {Disabled, Identifier} from '@terseware/ui/atoms';
import {Focused} from '@terseware/ui/atoms/interactions';
import {injectElement} from '@terseware/ui/internal';

/** Item participating in a parent {@link RovingFocus} — tabindex `0` when active, `-1` otherwise. */
@Directive({
  exportAs: 'rovingFocusItem',
  hostDirectives: [Activatable, Identifier, Focused],
})
export class RovingFocusItem {
  readonly #interactive = inject(Activatable);
  readonly element = injectElement();
  readonly id = inject(Identifier);
  readonly hardDisabled = inject(Disabled).isHardDisabled;
  readonly softDisabled = inject(Disabled).isSoftDisabled;

  readonly #focused = inject(Focused);
  readonly isActive = this.#focused.isFocused.bind(this);

  constructor() {
    this.#interactive.tabIndex.link(() => (this.isActive() ? 0 : -1));
  }

  focus() {
    this.#focused.focus();
  }

  blur() {
    this.#focused.blur();
  }
}
