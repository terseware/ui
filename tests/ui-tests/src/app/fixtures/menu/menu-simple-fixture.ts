import {Component} from '@angular/core';
import {TestMenu, TestMenuItem, TestMenuTrigger} from '../../ui/test-menu';

@Component({
  selector: 'test-menu-fixture',
  imports: [TestMenuTrigger, TestMenu, TestMenuItem],
  template: `
    <button [testMenuTrigger]="menu">Menu Trigger</button>
    <ng-template #menu>
      <test-menu>
        <span testMenuItem>Menu Item 1</span>
        <button testMenuItem>Menu Item 2</button>
        <div testMenuItem>Menu Item 3</div>
        <button testMenuItem>Menu Item 4</button>
      </test-menu>
    </ng-template>
  `,
})
export class TestMenuSimpleFixture {}
