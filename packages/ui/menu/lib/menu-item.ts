import {computed, Directive, inject, model} from '@angular/core';
import {AttrRole} from '@terseware/ui/atoms';
import {Hovered} from '@terseware/ui/atoms/interactions';
import {Button, provideButtonOpts} from '@terseware/ui/button';
import {injectElement} from '@terseware/ui/internal';
import {RovingFocusItem} from '@terseware/ui/roving-focus';
import {Menu} from './menu';
import {MenuTrigger} from './menu-trigger';

/**
 * Activatable item inside a `Menu` — roving-focus participant, keyboard
 * activatable, closes the containing menu on click by default.
 */
@Directive({
  exportAs: 'menuItem',
  providers: [provideButtonOpts({composite: true})],
  hostDirectives: [Button, RovingFocusItem, Hovered, AttrRole],
  host: {
    '[attr.data-highlighted]': 'isHighlighted() ? "" : null',
    '(click)': 'onClick()',
    '(pointerenter)': 'onPointerEnter($event)',
    '(mouseup)': 'onMouseUp()',
  },
})
export class MenuItem {
  readonly #element = injectElement();
  readonly rovingItem = inject(RovingFocusItem);
  readonly id = this.rovingItem.id;
  readonly hovered = inject(Hovered);

  /** Resolves via the containing `Menu` so submenu-trigger items don't shadow the parent trigger. */
  readonly #containingMenu = inject(Menu);
  readonly trigger = this.#containingMenu.trigger;

  /** Non-null when this item is also a submenu trigger — toggling is handled by `MenuTrigger.onMouseDown`. */
  readonly #selfTrigger = inject(MenuTrigger, {optional: true, self: true});

  readonly isActive = computed(() => this.rovingItem.isActive());
  readonly isHighlighted = computed(() => this.hovered() || this.rovingItem.isActive());

  /** Set to `false` by `MenuCheckboxItem`/`MenuRadioItem` so activation updates state without dismissing the menu. */
  readonly closeOnClick = model(true);

  constructor() {
    inject(AttrRole).set('menuitem');
  }

  protected onClick(): void {
    // Submenu trigger items: MenuTrigger.onMouseDown already toggled — don't close the parent or the child would flicker.
    if (this.#selfTrigger) return;
    if (!this.closeOnClick()) return;
    this.trigger.close('click');
  }

  protected onPointerEnter(event: PointerEvent): void {
    if (event.pointerType === 'touch') return;
    this.rovingItem.focus();
  }

  protected onMouseUp() {
    if (this.trigger.allowItemClickOnMouseUp()) {
      this.#element.click();
    }
  }
}
