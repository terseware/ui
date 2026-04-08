import {Directive, model, signal} from '@angular/core';
import type {RovingFocusItem} from './roving-focus-item';

export type RovingOrientation = 'horizontal' | 'vertical';

@Directive({
  exportAs: 'rovingFocusGroup',
  host: {
    '(keydown)': 'onKeydown($event)',
  },
})
export class RovingFocusGroup {
  readonly orientation = model<RovingOrientation>('vertical', {
    alias: 'rovingFocusGroupOrientation',
  });

  readonly wrap = model(true, {alias: 'rovingFocusGroupWrap'});
  readonly homeEnd = model(true, {alias: 'rovingFocusGroupHomeEnd'});
  readonly disabled = model(false, {alias: 'rovingFocusGroupDisabled'});

  readonly #items = signal<RovingFocusItem[]>([]);
  readonly #activeId = signal<string | null>(null);

  readonly activeId = this.#activeId.asReadonly();

  isActive(id: string): boolean {
    return this.#activeId() === id;
  }

  register(item: RovingFocusItem): () => void {
    this.#items.update((items) => [...items, item]);

    // First registered item becomes tabbable
    if (!this.#activeId()) {
      this.#activeId.set(item.id());
    }

    return () => {
      this.#items.update((items) => items.filter((i) => i !== item));
    };
  }

  setActive(id: string): void {
    this.#activeId.set(id);
    const item = this.#items().find((i) => i.id() === id);
    item?.focus();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;

    const orientation = this.orientation();

    switch (event.key) {
      case 'ArrowUp':
        if (orientation === 'vertical') {
          event.preventDefault();
          this.#activatePrev();
        }
        break;
      case 'ArrowDown':
        if (orientation === 'vertical') {
          event.preventDefault();
          this.#activateNext();
        }
        break;
      case 'ArrowLeft':
        if (orientation === 'horizontal') {
          event.preventDefault();
          this.#activatePrev();
        }
        break;
      case 'ArrowRight':
        if (orientation === 'horizontal') {
          event.preventDefault();
          this.#activateNext();
        }
        break;
      case 'Home':
        if (this.homeEnd()) {
          event.preventDefault();
          this.#activateFirst();
        }
        break;
      case 'End':
        if (this.homeEnd()) {
          event.preventDefault();
          this.#activateLast();
        }
        break;
    }
  }

  #sorted(): RovingFocusItem[] {
    return [...this.#items()].sort((a, b) =>
      a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
    );
  }

  #activateFirst(): void {
    const item = this.#sorted().find((i) => !i.disabled());
    if (item) this.setActive(item.id());
  }

  #activateLast(): void {
    const item = [...this.#sorted()].reverse().find((i) => !i.disabled());
    if (item) this.setActive(item.id());
  }

  #activateNext(): void {
    const sorted = this.#sorted();
    const idx = sorted.findIndex((i) => i.id() === this.#activeId());
    const next = sorted.slice(idx + 1).find((i) => !i.disabled());

    if (next) {
      this.setActive(next.id());
    } else if (this.wrap()) {
      this.#activateFirst();
    }
  }

  #activatePrev(): void {
    const sorted = this.#sorted();
    const idx = sorted.findIndex((i) => i.id() === this.#activeId());
    const prev = sorted
      .slice(0, idx)
      .reverse()
      .find((i) => !i.disabled());

    if (prev) {
      this.setActive(prev.id());
    } else if (this.wrap()) {
      this.#activateLast();
    }
  }
}
