import {Directive} from '@angular/core';
import {HardDisabled, SoftDisabled} from '@terseware/ui/atoms';
import {Button} from '@terseware/ui/button';
import {
  Menu,
  MenuCheckboxItem,
  MenuGroup,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger,
  MenuTriggerFor,
} from '@terseware/ui/menu';

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
  hostDirectives: [
    {
      directive: Menu,
      inputs: ['side', 'offset'],
    },
  ],
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
    Button,
    MenuTrigger,
  ],
})
export class TestMenuTrigger {}

@Directive({
  selector: 'test-menu-separator, [testMenuSeparator]',
  hostDirectives: [MenuSeparator],
})
export class TestMenuSeparator {}

@Directive({
  selector: 'test-menu-group, [testMenuGroup]',
  hostDirectives: [MenuGroup],
})
export class TestMenuGroup {}

@Directive({
  selector: 'test-menu-checkbox-item, [testMenuCheckboxItem]',
  hostDirectives: [
    {
      directive: MenuCheckboxItem,
      inputs: ['checked'],
      outputs: ['checkedChange'],
    },
  ],
})
export class TestMenuCheckboxItem {}

@Directive({
  selector: 'test-menu-radio-group, [testMenuRadioGroup]',
  hostDirectives: [
    {
      directive: MenuRadioGroup,
      inputs: ['value'],
      outputs: ['valueChange'],
    },
  ],
})
export class TestMenuRadioGroup {}

@Directive({
  selector: 'test-menu-radio-item, [testMenuRadioItem]',
  hostDirectives: [
    {
      directive: MenuRadioItem,
      inputs: ['value'],
    },
  ],
})
export class TestMenuRadioItem {}
