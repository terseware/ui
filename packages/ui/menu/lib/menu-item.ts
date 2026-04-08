import {Directive} from '@angular/core';
import {Button, provideButtonOpts} from '@terseware/ui/button';
import {RovingFocusItem} from '@terseware/ui/roving-focus';

@Directive({
  exportAs: 'menuItem',
  providers: [provideButtonOpts({composite: true})],
  hostDirectives: [Button, RovingFocusItem],
})
export class MenuItem {}
