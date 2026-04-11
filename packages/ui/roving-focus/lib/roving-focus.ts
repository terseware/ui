import {booleanAttribute, contentChildren, Directive, inject, input} from '@angular/core';
import {Keys, Orientation} from '@terseware/ui/atoms';
import {RovingFocusItem} from './roving-focus-item';

/**
 * Roving-tabindex container. Wires arrow keys (orientation-aware) plus
 * `Home`/`End` to walk through child {@link RovingFocusItem}s, skipping
 * hard-disabled items and optionally wrapping at the ends.
 *
 * Soft-disabled items stay in the traversal order so a user can still
 * land on them with the keyboard — activation is blocked separately by
 * `Disabled` itself. Hard-disabled items are skipped entirely.
 */
@Directive({
  selector: '[rovingFocus]:not([unterse~="rovingFocus"]):not([unterse=""])',
  exportAs: 'rovingFocus',
  hostDirectives: [Keys, Orientation],
})
export class RovingFocus {
  readonly enabled = input(true, {alias: 'rovingFocus', transform: booleanAttribute});
  readonly wrap = input(true, {alias: 'rovingFocusWrap', transform: booleanAttribute});
  readonly homeEnd = input(true, {alias: 'rovingFocusHomeEnd', transform: booleanAttribute});

  readonly orientation = inject(Orientation);
  readonly items = contentChildren(RovingFocusItem, {descendants: true});

  constructor() {
    const keys = inject(Keys);

    const whenVertical = () => this.enabled() && this.orientation() !== 'horizontal';
    const whenHorizontal = () => this.enabled() && this.orientation() === 'horizontal';
    const whenHomeEnd = () => this.enabled() && this.homeEnd();

    // Arrow keys are registered unconditionally; `when` gates them by
    // orientation so the off-axis pair is a no-op (and their preventDefault
    // / stopPropagation don't fire, letting the event bubble naturally).
    keys.on('ArrowUp', () => this.focusPrev(), {when: whenVertical, ignoreRepeat: false});
    keys.on('ArrowDown', () => this.focusNext(), {when: whenVertical, ignoreRepeat: false});
    keys.on('ArrowLeft', () => this.focusPrev(), {when: whenHorizontal, ignoreRepeat: false});
    keys.on('ArrowRight', () => this.focusNext(), {when: whenHorizontal, ignoreRepeat: false});

    keys.on('Home', () => this.focusFirst(), {when: whenHomeEnd});
    keys.on('End', () => this.focusLast(), {when: whenHomeEnd});
  }

  focusFirst(): void {
    this.#step(-1, 1)?.focus();
  }

  focusLast(): void {
    this.#step(this.items().length, -1)?.focus();
  }

  focusNext(): void {
    this.#step(this.#currentIndex(), 1)?.focus();
  }

  focusPrev(): void {
    this.#step(this.#currentIndex(), -1)?.focus();
  }

  /** Index of the item that currently owns DOM focus, or `-1` if none. */
  #currentIndex(): number {
    const active = document.activeElement;
    return this.items().findIndex((item) => item.element === active);
  }

  /**
   * Step from `from` in direction `dir` until we land on a non-hard-disabled
   * item, or exhaust the list. Wrap-aware: if `wrap` is on, walks around
   * the ends; if off, stops at the boundary. Returns `undefined` when no
   * reachable item exists (empty list, all disabled, or hit the boundary).
   */
  #step(from: number, dir: 1 | -1): RovingFocusItem | undefined {
    const items = this.items();
    const n = items.length;
    if (n === 0) return undefined;

    const wrap = this.wrap();
    for (let i = 1; i <= n; i++) {
      let idx = from + dir * i;
      if (wrap) {
        idx = ((idx % n) + n) % n;
      } else if (idx < 0 || idx >= n) {
        return undefined;
      }
      if (!items[idx]?.hardDisabled()) return items[idx];
    }
    return undefined;
  }
}
