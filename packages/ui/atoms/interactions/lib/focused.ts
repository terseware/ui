import {Directive, signal} from '@angular/core';
import {injectElement} from '@terseware/ui/internal';
import {State} from '@terseware/ui/state';

export type FocusedFrom = 'touch' | 'mouse' | 'keyboard' | 'program';

export interface FocusedState {
  focused: boolean;
  focusedVisible: boolean;
}

@Directive({
  exportAs: 'focused',
  host: {
    '[attr.data-focus]': 'snapshot(x => x.focused) ? "" : null',
    '[attr.data-focus-visible]': 'snapshot(x => x.focusedVisible) ? "" : null',
    '(focus)': 'onFocus($event)',
    '(blur)': 'onBlur()',
  },
})
export class Focused extends State<FocusedState> {
  readonly #element = injectElement();

  constructor() {
    super(signal({focused: false, focusedVisible: false}));
  }

  focus() {
    this.#element.focus();
  }

  blur() {
    this.#element.blur();
  }

  protected onFocus(event: FocusEvent) {
    const target = event.target as HTMLElement | null;
    this.patch({
      focused: true,
      focusedVisible: target?.matches(':focus-visible') === true,
    });
  }

  protected onBlur() {
    this.patch({focused: false, focusedVisible: false});
  }
}
