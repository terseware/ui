import {Component} from '@angular/core';
import {Menu, MenuItem, MenuTrigger} from '@terseware/ui/menu';

@Component({
  selector: 'app-home',
  imports: [MenuTrigger, Menu, MenuItem],
  template: `
    <div>
      <button [menuTrigger]="menu">s</button>
      <ng-template #menu>
        <div menu>
          <button menuItem>1</button>
          <button menuItem>1</button>
          <button menuItem>1</button>
          <button menuItem>1</button>
          <button menuItem>1</button>
        </div>
      </ng-template>
    </div>
  `,
})
export class Home {}
