import {DestroyRef, Directive, inject} from '@angular/core';
import {Anchored, provideAnchoredOpts} from '@terseware/ui/anchor';
import {TerseId} from '@terseware/ui/atoms';
import {RovingFocusGroup} from '@terseware/ui/roving-focus';
import {MenuTrigger} from './menu-trigger';

@Directive({
  exportAs: 'menu',
  hostDirectives: [Anchored, RovingFocusGroup, TerseId],
  providers: [provideAnchoredOpts({side: 'bottom span-right'})],
})
export class Menu {
  readonly #destroyRef = inject(DestroyRef);
  readonly trigger = inject(MenuTrigger);
  readonly id = inject(TerseId);

  constructor() {
    this.#destroyRef.onDestroy(this.trigger.setMenu(this));
  }
}
