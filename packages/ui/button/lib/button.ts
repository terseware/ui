import {Directive, inject} from '@angular/core';
import {Disabled, Keys, Role, SoftDisabled, TabIndex, Type} from '@terseware/ui/atoms';
import {
  injectElement,
  isAnchorElement,
  isButtonElement,
  isInputElement,
} from '@terseware/ui/internal';
import {pipe} from '@terseware/ui/state';

/**
 * Cross-element button behavior. Ensures `role="button"` and
 * `type="button"` on non-native hosts and synthesizes click on Enter /
 * Space keydown so any element — `<div>`, `<span>`, `<button>`, `<a>` —
 * behaves like a real button when interacted with via the keyboard.
 *
 * The synthesis applies uniformly: one code path for natives and
 * non-natives alike. `preventDefault` on the keydown suppresses the
 * browser's own activation sequence (Enter's immediate keydown click and
 * Space's pressed-then-keyup-click dance), so our synchronous
 * `element.click()` is the only click that fires. This avoids the
 * native-vs-non-native branching that used to bite menu items and other
 * downstream consumers, and it keeps activation consistent across test
 * environments that don't model the browser's keyboard-to-click
 * conversion (jsdom, happy-dom).
 *
 * Keyboard handling is wired through the shared `Keys` registry rather
 * than a direct host listener, so consumers that compose `Button` (menu
 * items, combobox options, etc.) can layer their own `Keys` bindings on
 * the same host with deterministic ordering and `when`-predicate
 * coordination. Nothing special is needed inside `Button` to play nicely
 * with them — every interested directive fires from one dispatch loop.
 */
@Directive({
  selector: '[button]:not([unterse~="button"]):not([unterse=""])',
  exportAs: 'button',
  hostDirectives: [
    {directive: Disabled, inputs: ['disabled']},
    {directive: SoftDisabled, inputs: ['softDisabled']},
    {directive: TabIndex, inputs: ['tabIndex']},
    {directive: Role, inputs: ['role']},
    {directive: Type, inputs: ['type']},
    Keys,
  ],
})
export class Button {
  readonly #element = injectElement();
  readonly disabled = inject(Disabled).asReadonly();
  readonly softDisabled = inject(SoftDisabled).asReadonly();

  constructor() {
    pipe(Role, (role) => role ?? (this.#isBtnRole ? null : 'button'));
    pipe(Type, (type) => type ?? (this.#isButton ? 'button' : null));

    // Enter + Space both synthesize click on keydown. `Keys` default
    // `preventDefault: true` both prevents page scroll on Space and
    // suppresses the browser's own keydown-triggered activation
    // (Enter's immediate click on natives, Space's pressed-then-
    // keyup-click). The disabled check lives INSIDE the handler rather
    // than as a `when` predicate so that `preventDefault` still fires
    // when disabled — otherwise a disabled non-native would scroll the
    // page on Space.
    const activate = (event: KeyboardEvent): void => {
      if (this.disabled()) return;
      if (event.target !== event.currentTarget) return;
      this.#element.click();
    };

    const keys = inject(Keys);
    keys.on('Enter', activate);
    keys.on(' ', activate);
  }

  get #isBtnRole(): boolean {
    return this.#isButton || this.#isLink || this.#isInput;
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
}
