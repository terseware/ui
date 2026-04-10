import {
  afterNextRender,
  computed,
  contentChildren,
  DestroyRef,
  Directive,
  effect,
  inject,
  input,
} from '@angular/core';
import {onClickOutside} from '@signality/core';
import {Anchored, provideAnchoredOpts, type AnchoredSide} from '@terseware/ui/anchor';
import {AttrRole, Identifier, Keys} from '@terseware/ui/atoms';
import {injectElement} from '@terseware/ui/internal';
import {RovingFocus} from '@terseware/ui/roving-focus';
import {MenuItem} from './menu-item';
import {MenuTrigger} from './menu-trigger';

/**
 * Menu popup primitive. Hosts a roving-focus group of `MenuItem`s, anchors
 * to its owning `MenuTrigger`, and closes on Escape / Tab / outside click.
 * Type-ahead select by letter is built in.
 */
@Directive({
  exportAs: 'menu',
  hostDirectives: [Anchored, RovingFocus, Identifier, AttrRole],
  providers: [provideAnchoredOpts({side: 'bottom span-right'})],
  host: {
    '(focusout)': 'onFocusOut($event)',
  },
})
export class Menu {
  static readonly TYPEAHEAD_RESET_MS = 500;

  readonly #destroyRef = inject(DestroyRef);
  readonly element = injectElement();
  readonly trigger = inject(MenuTrigger);
  readonly id = inject(Identifier);
  readonly focusGroup = inject(RovingFocus);
  readonly #anchored = inject(Anchored);

  /** Anchor placement relative to the trigger. Declared direct (not forwarded from `Anchored`) so wrappers can re-forward it. */
  readonly side = input<AnchoredSide | undefined>(undefined);

  /** Anchor margin (CSS length or px number). */
  readonly offset = input<string | number | undefined>(undefined);

  readonly items = contentChildren(MenuItem, {descendants: true});
  readonly activeItem = computed(() => this.items().find((i) => i.isActive()));

  #typeaheadBuffer = '';
  #typeaheadTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    inject(AttrRole).set('menu');

    // Sync direct inputs to the underlying Anchored models; undefined keeps the provider default.
    effect(() => {
      const side = this.side();
      if (side !== undefined) this.#anchored.anchoredSide.set(side);
    });
    effect(() => {
      const offset = this.offset();
      if (offset !== undefined) this.#anchored.anchoredMargin.set(offset);
    });

    inject(Keys)
      .on('Escape', () => this.trigger.close('escape'))
      .on('Tab', () => this.trigger.close('tab'))
      .on('ArrowLeft', () => {
        // Submenu only — closes just this level and refocuses the parent's trigger item.
        if (this.trigger.isSubmenu) {
          this.trigger.close('escape');
        }
      })
      .on(/^.$/u, (e) => this.#typeahead(e.key), {stopPropagation: false});

    this.#destroyRef.onDestroy(this.trigger.setMenu(this));

    // Run the trigger's pending open action (focusFirst/focusLast) after content is ready.
    afterNextRender(() => this.trigger.consumeOpenAction()(this));

    onClickOutside(this.element, () => this.trigger.close('outside'), {
      ignore: [this.trigger.element],
    });
  }

  #typeahead(char: string): void {
    if (this.#typeaheadTimer) {
      clearTimeout(this.#typeaheadTimer);
    }

    this.#typeaheadBuffer += char.toLowerCase();

    const match = this.items().find((item) =>
      item.rovingItem.element.textContent?.trim().toLowerCase().startsWith(this.#typeaheadBuffer),
    );

    if (match) {
      match.rovingItem.focus();
    }

    this.#typeaheadTimer = setTimeout(() => {
      this.#typeaheadBuffer = '';
      this.#typeaheadTimer = null;
    }, Menu.TYPEAHEAD_RESET_MS);
  }

  protected onFocusOut(event: FocusEvent): void {
    // Don't close if any sub-menus are open
    if (this.trigger.anyOpened()) return;

    const related = event.relatedTarget as Node | null;
    if (!related) {
      this.trigger.close('outside');
      return;
    }

    const menuEl = event.currentTarget as HTMLElement;
    const triggerEl = this.trigger.element;
    if (!menuEl.contains(related) && !triggerEl?.contains(related)) {
      this.trigger.close('outside');
    }
  }
}
