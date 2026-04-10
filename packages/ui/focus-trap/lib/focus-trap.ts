import {
  afterNextRender,
  booleanAttribute,
  Directive,
  DOCUMENT,
  inject,
  input,
  linkedSignal,
} from '@angular/core';
import {activeElement, listener, mutationObserver} from '@signality/core';
import {TabIndex} from '@terseware/ui/atoms';
import {injectElement} from '@terseware/ui/internal';
import {PublicWritableSource} from '@terseware/ui/state';

const TABBABLE_SELECTOR = [
  'a[href]',
  'button',
  'input',
  'textarea',
  'select',
  'details',
  'iframe',
  'embed',
  'object',
  'summary',
  'dialog',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]',
  '[tabindex]',
].join(', ');

function isVisible(el: HTMLElement): boolean {
  if (el.hasAttribute('disabled')) {
    return false;
  }
  if (el.hasAttribute('hidden')) {
    return false;
  }
  if (window.getComputedStyle(el).display === 'none') {
    return false;
  }
  return true;
}

@Directive({
  exportAs: 'focusTrapDisabled',
})
export class FocusTrapDisabled extends PublicWritableSource<boolean> {
  readonly focusTrapDisabled = input(false, {transform: booleanAttribute});
  constructor() {
    super(linkedSignal(() => this.focusTrapDisabled()));
  }
}

@Directive({
  exportAs: 'focusTrapAutoFocus',
})
export class FocusTrapAutoFocus extends PublicWritableSource<boolean> {
  readonly focusTrapAutoFocus = input(false, {transform: booleanAttribute});
  constructor() {
    super(linkedSignal(() => this.focusTrapAutoFocus()));
  }
}

@Directive({
  exportAs: 'focusTrap',
  hostDirectives: [TabIndex],
  host: {
    '[attr.data-focus-trap]': 'disabled() ? null : ""',
    '(keydown)': 'onKeydown($event)',
  },
})
export class FocusTrap {
  readonly #tabIndex = inject(TabIndex);

  readonly disabled = inject(FocusTrapDisabled);
  readonly autoFocus = inject(FocusTrapAutoFocus);

  readonly #element = injectElement();
  readonly #activeElement = activeElement();

  constructor() {
    this.#tabIndex.bindTo((source) => (this.disabled() ? source : -1));

    afterNextRender(() => {
      if (this.autoFocus() && !this.disabled()) {
        const [first] = this.#getTabbableEdges();
        first?.focus();
      }
    });

    mutationObserver(
      this.#element,
      () => {
        if (this.disabled()) {
          return;
        }

        // If the focused element was removed, refocus the container
        if (!this.#element.contains(this.#activeElement())) {
          const [first] = this.#getTabbableEdges();
          if (first) {
            first.focus();
          } else {
            this.#element.focus();
          }
        }
      },
      {childList: true, subtree: true},
    );

    listener.capture(inject(DOCUMENT), 'focusin', (event) => {
      if (this.disabled()) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (!target || this.#element.contains(target)) {
        return;
      }

      // Redirect focus back inside the trap
      const [first] = this.#getTabbableEdges();
      if (first) {
        first.focus();
      } else {
        this.#element.focus();
      }
    });
  }

  #getTabbableEdges() {
    const candidates = this.#element.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR);
    const tabbable = Array.from(candidates).filter(isVisible);
    return [tabbable[0] ?? null, tabbable[tabbable.length - 1] ?? null];
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab' || this.disabled()) {
      return;
    }

    const [first, last] = this.#getTabbableEdges();
    if (!first || !last) {
      // No tabbable elements — prevent Tab from leaving
      event.preventDefault();
      return;
    }

    if (event.shiftKey && this.#activeElement() === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && this.#activeElement() === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
