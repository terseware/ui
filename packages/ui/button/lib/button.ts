import {Directive, inject} from '@angular/core';
import {AttrRole, AttrType} from '@terseware/ui/atoms';
import {Interactive} from '@terseware/ui/interactive';
import {
  injectElement,
  isAnchorElement,
  isButtonElement,
  isInputElement,
  optsBuilder,
} from '@terseware/ui/internal';

export interface ProtoButtonOpts {
  composite: boolean;
}

const [provideButtonOpts, injectButtonOpts] = optsBuilder<ProtoButtonOpts>('ProtoButton', {
  composite: false,
});

export {provideButtonOpts};

@Directive({
  exportAs: 'button',
  hostDirectives: [Interactive, AttrRole, AttrType],
  host: {
    '(keydown)': 'onKeyDown($event)',
    '(keyup)': 'onKeyUp($event)',
  },
})
export class Button {
  readonly #element = injectElement();
  readonly #opts = injectButtonOpts();
  readonly interactive = inject(Interactive);
  readonly role = inject(AttrRole);
  readonly type = inject(AttrType);

  constructor() {
    this.role.bindTo(
      (role) => role ?? (this.#isButton || this.#isLink || this.#isInput ? null : 'button'),
    );

    this.type.bindTo((type) => type ?? (this.#isButton ? 'button' : null));
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

  /** Whether the host element has native button-like activation (Enter/Space). */
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
