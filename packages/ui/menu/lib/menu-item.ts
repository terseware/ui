import {DestroyRef, Directive, inject} from '@angular/core';
import {Button, provideButtonOpts} from '@terseware/ui/button';
import {RovingFocusItem} from '@terseware/ui/roving-focus';
import {MenuTrigger} from './menu-trigger';

@Directive({
  exportAs: 'menuItem',
  providers: [provideButtonOpts({composite: true})],
  hostDirectives: [Button, RovingFocusItem],
})
export class MenuItem {
  readonly rovingItem = inject(RovingFocusItem);
  readonly trigger = inject(MenuTrigger);

  constructor() {
    inject(DestroyRef).onDestroy(this.trigger.addItem(this));
  }
}
