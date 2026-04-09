import {Directive, forwardRef, inject} from '@angular/core';
import {listener} from '@signality/core';
import {Disabled, TabIndex} from '@terseware/ui/atoms';
import {hasDisabledAttribute, injectElement} from '@terseware/ui/internal';

@Directive({
  exportAs: 'interactive',
  hostDirectives: [Disabled, forwardRef(() => TabIndex)],
  host: {
    '(keydown)': 'onKeyDown($event)',
  },
})
export class Interactive {
  readonly #element = injectElement();
  readonly tabIndex = inject(TabIndex);
  readonly disabled = inject(Disabled);

  constructor() {
    this.tabIndex.bindSource((tabIndex) => {
      if (!hasDisabledAttribute(this.#element) && this.disabled()) {
        tabIndex = this.disabled.soft() ? tabIndex : -1;
      }
      return tabIndex;
    });

    // Capture-phase listener registered early so it fires before Angular's
    // template-bound (click) handlers and can block them when disabled.
    listener.capture(this.#element, 'click', (event) => {
      if (this.disabled()) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    });
  }

  /**
   * Blocks activation keys (Enter, Space) when soft-disabled.
   * Navigation keys (arrows, Escape, Home, End, Tab) are always allowed
   * so parent containers (menus, listboxes, toolbars) can still navigate
   * through soft-disabled items.
   */
  protected onKeyDown(event: KeyboardEvent): void {
    if (this.disabled.soft() && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
    }
  }
}
