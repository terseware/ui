import {Directive} from '@angular/core';
import {HardDisabled, SoftDisabled} from '@terseware/ui/atoms';
import {Menu, MenuItem, MenuTrigger, MenuTriggerFor} from '@terseware/ui/menu';

@Directive({
  selector: 'test-menu-item, [testMenuItem]',
  hostDirectives: [
    MenuItem,
    {
      directive: HardDisabled,
      inputs: ['hardDisabled:hard'],
    },
    {
      directive: SoftDisabled,
      inputs: ['softDisabled:soft'],
    },
  ],
})
export class TestMenuItem {}

@Directive({
  selector: 'test-menu, [testMenu]',
  hostDirectives: [Menu],
  host: {
    'data-slot': 'menu',
  },
})
export class TestMenu {}

@Directive({
  selector: 'test-menu-trigger, [testMenuTrigger]',
  hostDirectives: [
    {
      directive: MenuTriggerFor,
      inputs: ['menuTriggerFor:testMenuTrigger'],
    },
    MenuTrigger,
  ],
})
export class TestMenuTrigger {}
