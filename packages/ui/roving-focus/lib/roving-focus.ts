import {computed, contentChildren, Directive, inject, model} from '@angular/core';
import {KeyboardEvents} from '@terseware/ui/atoms';
import {RovingFocusItem} from './roving-focus-item';

export type RovingOrientation = 'horizontal' | 'vertical';

@Directive({
  exportAs: 'rovingFocus',
  hostDirectives: [KeyboardEvents],
})
export class RovingFocus {
  readonly orientation = model<RovingOrientation>('vertical', {
    alias: 'rovingFocusOrientation',
  });

  readonly wrap = model(true, {alias: 'rovingFocusWrap'});
  readonly homeEnd = model(true, {alias: 'rovingFocusHomeEnd'});
  readonly disabled = model(false, {alias: 'rovingFocusDisabled'});

  readonly items = contentChildren(RovingFocusItem, {descendants: true});
  readonly focusedItem = computed(() => this.items().find((i) => i.isActive()));

  constructor() {
    const prevKey = computed(() => (this.orientation() === 'vertical' ? 'ArrowUp' : 'ArrowLeft'));
    const nextKey = computed(() =>
      this.orientation() === 'vertical' ? 'ArrowDown' : 'ArrowRight',
    );

    inject(KeyboardEvents)
      .on(prevKey, () => this.focusPrev(), {ignoreRepeat: false})
      .on(nextKey, () => this.focusNext(), {ignoreRepeat: false})
      .on(
        'Home',
        (e) => {
          if (!this.homeEnd()) return;
          e.preventDefault();
          this.focusFirst();
        },
        {preventDefault: false, stopPropagation: false},
      )
      .on(
        'End',
        (e) => {
          if (!this.homeEnd()) return;
          e.preventDefault();
          this.focusLast();
        },
        {preventDefault: false, stopPropagation: false},
      );
  }

  focusFirst(): void {
    this.items()
      .find((i) => !i.hardDisabled())
      ?.focus();
  }

  focusLast(): void {
    [...this.items()]
      .reverse()
      .find((i) => !i.hardDisabled())
      ?.focus();
  }

  focusNext(): void {
    const items = this.items();
    const idx = items.findIndex((i) => i.id() === this.focusedItem()?.id());
    // Soft-disabled items stay in the navigation order so the user can see
    // them while walking through the menu; activation is blocked by
    // Interactive.onKeyDown. Only hard-disabled items are skipped.
    const next = items.slice(idx + 1).find((i) => !i.hardDisabled());

    if (next) {
      next.focus();
    } else if (this.wrap()) {
      this.focusFirst();
    }
  }

  focusPrev(): void {
    const items = this.items();
    const idx = items.findIndex((i) => i.id() === this.focusedItem()?.id());
    const prev = items
      .slice(0, idx)
      .reverse()
      .find((i) => !i.hardDisabled());

    if (prev) {
      prev.focus();
    } else if (this.wrap()) {
      this.focusLast();
    }
  }
}
