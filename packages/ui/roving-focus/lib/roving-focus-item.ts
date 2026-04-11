import {computed, Directive, inject} from '@angular/core';
import {Disabled, Identifier, TabIndex} from '@terseware/ui/atoms';
import {Focused} from '@terseware/ui/interactions';
import {injectElement} from '@terseware/ui/internal';
import {pipe} from '@terseware/ui/state';

/**
 * Item participating in a parent {@link RovingFocus}. Gets `tabindex=0`
 * while it owns focus and `tabindex=-1` otherwise, so the group exposes
 * exactly one tab stop to the page's outer focus order.
 *
 * Composes `Focused` for modality-aware programmatic focus and CSS
 * styling hooks, and `Identifier` so consumers can reference the item
 * by id (aria-activedescendant, aria-labelledby, etc.). Reads `Disabled`
 * to let the parent container skip hard-disabled items during traversal.
 */
@Directive({
  selector: '[rovingFocusItem]:not([unterse~="rovingFocusItem"]):not([unterse=""])',
  exportAs: 'rovingFocusItem',
  hostDirectives: [Identifier, Focused],
})
export class RovingFocusItem {
  readonly element = injectElement();
  readonly id = inject(Identifier);
  readonly disabled = inject(Disabled);
  readonly hardDisabled = this.disabled.hard;
  readonly softDisabled = this.disabled.soft;

  readonly #focused = inject(Focused);
  readonly isActive = computed(() => !!this.#focused().focused);

  constructor() {
    pipe(TabIndex, () => (this.isActive() ? 0 : -1));
  }

  focus(): void {
    this.#focused.focus();
  }

  blur(): void {
    this.#focused.blur();
  }
}
