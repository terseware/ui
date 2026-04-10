import {Directive} from '@angular/core';
import {Disabled} from '@terseware/ui/atoms';
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
} from '@terseware/ui/menu';

@Directive({
  selector: 'test-menu-item, [testMenuItem]',
  hostDirectives: [
    MenuItem,
    {
      directive: Disabled,
      inputs: ['hardDisabled:hard', 'softDisabled:soft'],
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
      directive: MenuTrigger,
      inputs: ['menuTriggerFor:testMenuTrigger'],
    },
    Button,
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
