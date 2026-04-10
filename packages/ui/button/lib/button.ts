import {Directive, inject} from '@angular/core';
import {Activatable} from '@terseware/ui/activatable';
import {AttrRole, AttrType} from '@terseware/ui/atoms';
import {
  injectElement,
  isAnchorElement,
  isButtonElement,
  isInputElement,
  optsBuilder,
} from '@terseware/ui/internal';

/** Options for {@link Button}. `composite` fires activation on keydown instead of keyup. */
export interface ProtoButtonOpts {
  composite: boolean;
}

const [provideButtonOpts, injectButtonOpts] = optsBuilder<ProtoButtonOpts>('ProtoButton', {
  composite: false,
});

export {provideButtonOpts};

/**
 * Cross-element button behavior. Ensures `role="button"` + `type="button"`
 * on non-native hosts and synthesizes click on Enter/Space so `<div>`s and
 * `<span>`s act like real buttons.
 */
@Directive({
  exportAs: 'button',
  hostDirectives: [Activatable, AttrRole, AttrType],
  host: {
    '(keydown)': 'onKeyDown($event)',
    '(keyup)': 'onKeyUp($event)',
  },
})
export class Button {
  readonly #element = injectElement();
  readonly #opts = injectButtonOpts();
  readonly interactive = inject(Activatable);
  readonly role = inject(AttrRole);
  readonly type = inject(AttrType);

  constructor() {
    this.role.link(
      (role) => role ?? (this.#isButton || this.#isLink || this.#isInput ? null : 'button'),
    );

    this.type.link((type) => type ?? (this.#isButton ? 'button' : null));
  }

  get #isButton(): boolean {
    return isButtonElement(this.#element);
  }
  get #isLink(): boolean {
    return isAnchorElement(this.#element, {validLink: true});
  }
  get #isInput(): boolean {
    return isInputElement(this.#element, {
      types: ['button', 'submit', 'reset', 'image'],
    });
  }

  get #isNativeActivatable(): boolean {
    return this.#isButton || this.#isInput;
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (this.interactive.disabled()) {
      return;
    }

    if (this.#isNativeActivatable && !this.#opts.composite) {
      return;
    }

    const isCurrentTarget = event.target === event.currentTarget;
    if (!isCurrentTarget) {
      return;
    }

    // Composite: Space fires click immediately on keydown.
    if (this.#opts.composite && event.key === ' ') {
      event.preventDefault();
      this.#element.click();
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      this.#element.click();
    } else if (event.key === ' ') {
      // Prevent scroll on Space for non-native buttons.
      event.preventDefault();
    }
  }

  protected onKeyUp(event: KeyboardEvent): void {
    if (this.interactive.disabled()) {
      return;
    }

    // Composite buttons already handled Space on keydown — suppress here.
    if (this.#opts.composite && event.key === ' ') {
      event.preventDefault();
      return;
    }

    if (this.#isNativeActivatable) {
      return;
    }

    if (event.target === event.currentTarget && event.key === ' ') {
      this.#element.click();
    }
  }
}
