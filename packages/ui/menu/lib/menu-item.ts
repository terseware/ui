import {computed, Directive, inject} from '@angular/core';
import {AttrRole} from '@terseware/ui/atoms';
import {Hovered} from '@terseware/ui/atoms/interactions';
import {Button, provideButtonOpts} from '@terseware/ui/button';
import {injectElement} from '@terseware/ui/internal';
import {RovingFocusItem} from '@terseware/ui/roving-focus';
import {Menu} from './menu';
import {MenuTrigger} from './menu-trigger';

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

  /**
   * The trigger that owns the menu that *contains* this item. Resolved via
   * the containing `Menu` instance so a submenu-trigger menu item (which has
   * its own `MenuTrigger` on self) doesn't shadow it and accidentally close
   * the child menu instead of the parent.
   */
  readonly #containingMenu = inject(Menu);
  readonly trigger = this.#containingMenu.trigger;

  /**
   * A `MenuTrigger` composed onto the *same* element — present only when
   * this menu item is also a submenu trigger (e.g. `terseMenuItem` +
   * `terseMenuTriggerFor`). When present, click activation is handled by
   * `MenuTrigger.onMouseDown` (toggle open/close), so we must skip the
   * default "close parent on click" behavior below.
   */
  readonly #selfTrigger = inject(MenuTrigger, {optional: true, self: true});

  readonly isActive = computed(() => this.rovingItem.isActive());
  readonly isHighlighted = computed(() => this.hovered() || this.rovingItem.isActive());

  constructor() {
    inject(AttrRole).set('menuitem');
  }

  protected onClick(): void {
    // Submenu trigger items manage their own open/close via MenuTrigger; the
    // click event that immediately follows mousedown must not close the
    // containing menu, otherwise the child menu would flash open and shut.
    if (this.#selfTrigger) return;
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
