import {
  afterNextRender,
  computed,
  contentChildren,
  DestroyRef,
  Directive,
  inject,
} from '@angular/core';
import {onClickOutside} from '@signality/core';
import {Anchored, provideAnchoredOpts} from '@terseware/ui/anchor';
import {AttrRole, KeyboardEvents, TerseId} from '@terseware/ui/atoms';
import {injectElement} from '@terseware/ui/internal';
import {RovingFocus} from '@terseware/ui/roving-focus';
import {MenuItem} from './menu-item';
import {MenuTrigger} from './menu-trigger';

@Directive({
  exportAs: 'menu',
  hostDirectives: [Anchored, RovingFocus, TerseId, AttrRole],
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
  readonly id = inject(TerseId);
  readonly focusGroup = inject(RovingFocus);

  readonly items = contentChildren(MenuItem, {descendants: true});
  readonly activeItem = computed(() => this.items().find((i) => i.isActive()));

  #typeaheadBuffer = '';
  #typeaheadTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    inject(AttrRole).set('menu');

    inject(KeyboardEvents)
      .on('Escape', () => this.trigger.close())
      .on('Tab', () => this.trigger.close())
      .on(/^.$/u, (e) => this.#typeahead(e.key), {stopPropagation: false});

    this.#destroyRef.onDestroy(this.trigger.setMenu(this));

    // Execute the trigger's pending open action (focusFirst/focusLast) after content is ready
    afterNextRender(() => this.trigger.consumeOpenAction()(this));

    // Close on click outside, ignoring the trigger element
    onClickOutside(this.element, () => this.trigger.close(), {
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
    const related = event.relatedTarget as Node | null;

    // Focus left the document entirely
    if (!related) {
      this.trigger.close();
      return;
    }

    const menuEl = event.currentTarget as HTMLElement;
    const triggerEl = this.trigger.element;

    // Focus moved outside both the menu and the trigger
    if (!menuEl.contains(related) && !triggerEl?.contains(related)) {
      this.trigger.close();
    }
  }
}
