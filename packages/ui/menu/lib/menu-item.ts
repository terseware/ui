import {computed, Directive, inject} from '@angular/core';
import {AttrRole} from '@terseware/ui/atoms';
import {Hovered} from '@terseware/ui/atoms/interactions';
import {Button, provideButtonOpts} from '@terseware/ui/button';
import {injectElement} from '@terseware/ui/internal';
import {RovingFocusItem} from '@terseware/ui/roving-focus';
import {MenuTrigger} from './menu-trigger';

@Directive({
  exportAs: 'menuItem',
  providers: [provideButtonOpts({composite: true})],
  hostDirectives: [Button, RovingFocusItem, Hovered, AttrRole],
  host: {
    '[attr.data-highlighted]': 'isHighlighted() ? "" : null',
    '(click)': 'trigger.close()',
    '(pointerenter)': 'onPointerEnter($event)',
    '(mouseup)': 'onMouseUp()',
  },
})
export class MenuItem {
  readonly #element = injectElement();
  readonly rovingItem = inject(RovingFocusItem);
  readonly id = this.rovingItem.id;
  readonly hovered = inject(Hovered);
  readonly trigger = inject(MenuTrigger);
  readonly isActive = computed(() => this.rovingItem.isActive());
  readonly isHighlighted = computed(() => this.hovered() || this.rovingItem.isActive());

  constructor() {
    inject(AttrRole).set('menuitem');
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
