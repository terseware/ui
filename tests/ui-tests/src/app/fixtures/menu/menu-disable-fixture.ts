import {Component} from '@angular/core';
import {TestMenu, TestMenuItem, TestMenuTrigger} from '../../ui/test-menu';

@Component({
  selector: 'test-menu-fixture',
  imports: [TestMenuTrigger, TestMenu, TestMenuItem],
  template: `
    <span [testMenuTrigger]="menu">Menu Trigger</span>
    <ng-template #menu>
      <test-menu class="grid">
        <button testMenuItem>Native Enabled</button>
        <button testMenuItem hard>Native Hard Disabled</button>
        <button testMenuItem soft>Native soft Disabled</button>
        <span testMenuItem>Non-Native Enabled</span>
        <span testMenuItem hard>Non-Native Hard Disabled</span>
        <span testMenuItem soft>Non-Native soft Disabled</span>
      </test-menu>
    </ng-template>
  `,
})
export class TestMenuDisableFixture {}
