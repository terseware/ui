import {Directive, inject} from '@angular/core';
import {Anchored} from '@terseware/ui/anchor';
import {RovingFocusGroup} from '@terseware/ui/roving-focus';
import {MenuTrigger} from './menu-trigger';

@Directive({
  exportAs: 'menu',
  hostDirectives: [Anchored, RovingFocusGroup],
})
export class Menu {
  readonly trigger = inject(MenuTrigger);
}
