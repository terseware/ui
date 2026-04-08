import {DestroyRef, Directive, inject} from '@angular/core';
import {TerseId} from '@terseware/ui/atoms';
import {Interactive} from '@terseware/ui/interactive';
import {injectElement} from '@terseware/ui/internal';
import {RovingFocusGroup} from './roving-focus';

@Directive({
  exportAs: 'rovingFocusItem',
  hostDirectives: [Interactive, TerseId],
  host: {
    '(click)': 'onClick()',
  },
})
export class RovingFocusItem {
  readonly #interactive = inject(Interactive);
  readonly #group = inject(RovingFocusGroup);
  readonly element = injectElement();
  readonly id = inject(TerseId).source.bind(this);
  readonly disabled = this.#interactive.disabled.source;

  constructor() {
    this.#interactive.tabIndex.control((x) => (this.#group.isActive(this.id()) ? x : -1));
    inject(DestroyRef).onDestroy(this.#group.register(this));
  }

  focus() {
    this.element.focus();
  }

  protected onClick(): void {
    if (!this.#interactive.disabled()) {
      this.#group.setActive(this.id());
    }
  }
}
