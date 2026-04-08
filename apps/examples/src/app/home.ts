import {Component, Directive} from '@angular/core';
import {Menu, MenuItem, MenuTrigger, MenuTriggerFor} from '@terseware/ui/menu';

@Directive({
  selector: '[appMenuItem]',
  hostDirectives: [MenuItem],
})
export class AppMenuItem {}

@Directive({
  selector: '[appMenu]',
  hostDirectives: [Menu],
})
export class AppMenu {}

@Directive({
  selector: '[appMenuTrigger]',
  hostDirectives: [
    {
      directive: MenuTriggerFor,
      inputs: ['menuTriggerFor:appMenuTrigger'],
    },
    MenuTrigger,
  ],
})
export class AppMenuTrigger {}

@Component({
  selector: 'app-home',
  imports: [AppMenuTrigger, AppMenu, AppMenuItem],
  template: `
    <div>
      <button [appMenuTrigger]="menu">s</button>
      <ng-template #menu>
        <div appMenu>
          <button appMenuItem>1</button>
          <button appMenuItem>1</button>
          <button appMenuItem>1</button>
          <button appMenuItem>1</button>
          <button appMenuItem>1</button>
        </div>
      </ng-template>
    </div>
  `,
})
export class Home {}
