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
import {setupSync} from '@signality/core/browser/listener';
import {TabIndex} from '@terseware/ui/atoms';
import {injectElement} from '@terseware/ui/internal';
import {State} from '@terseware/ui/state';

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

/** Opt-out flag for {@link FocusTrap}. */
@Directive({
  exportAs: 'focusTrapDisabled',
})
export class FocusTrapDisabled extends State<boolean> {
  readonly focusTrapDisabled = input(false, {transform: booleanAttribute});
  constructor() {
    super(linkedSignal(() => this.focusTrapDisabled()));
  }
}

/** When `true`, {@link FocusTrap} focuses the first tabbable child on activation. */
@Directive({
  exportAs: 'focusTrapAutoFocus',
})
export class FocusTrapAutoFocus extends State<boolean> {
  readonly focusTrapAutoFocus = input(false, {transform: booleanAttribute});
  constructor() {
    super(linkedSignal(() => this.focusTrapAutoFocus()));
  }
}

/**
 * Traps Tab navigation inside the host subtree, cycling between its first
 * and last tabbable descendants. Redirects external `focusin` events back
 * inside and refocuses the container when the active element is removed.
 */
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
    this.#tabIndex.control(() => (this.disabled() ? 0 : -1));

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

    // Document-level listener — register synchronously so an early focusin
    // (e.g. between directive init and the next render tick) can't slip past.
    const doc = inject(DOCUMENT);
    setupSync(() =>
      listener.capture(doc, 'focusin', (event) => {
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
      }),
    );
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
