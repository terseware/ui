import {Directive, forwardRef, inject} from '@angular/core';
import {listener} from '@signality/core';
import {Disabled, TabIndex} from '@terseware/ui/atoms';
import {hasDisabledAttribute, injectElement} from '@terseware/ui/internal';

/**
 * Base interactive behavior: composes `Disabled` + `TabIndex`, suppresses
 * clicks and activation keys when disabled, and forces `tabindex=-1` on
 * hard-disabled non-native elements. Navigation keys pass through so parent
 * containers can still rove focus across soft-disabled children.
 */
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
    this.tabIndex.control((tabIndex) => {
      if (!hasDisabledAttribute(this.#element) && this.disabled()) {
        tabIndex = this.disabled.soft() ? tabIndex : -1;
      }
      return tabIndex;
    });

    // Capture-phase so it runs before template-bound (click) handlers.
    listener.capture(this.#element, 'click', (event) => {
      if (this.disabled()) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    });
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (this.disabled.soft() && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
    }
  }
}
