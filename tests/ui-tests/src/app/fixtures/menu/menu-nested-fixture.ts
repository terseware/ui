import {Component} from '@angular/core';
import {TestMenu, TestMenuItem, TestMenuTrigger} from '../../ui/test-menu';

/**
 * Two-level nested menu fixture modeled after Angular Material's animal
 * taxonomy example. Exercises the recursive `MenuTrigger` — the same
 * directive is applied to both the top-level trigger button and the
 * submenu-trigger menu items, with submenu behavior activated via DI
 * context detection (presence of a parent `Menu` in the element injector
 * tree).
 */
@Component({
  selector: 'test-menu-nested-fixture',
  imports: [TestMenuTrigger, TestMenu, TestMenuItem],
  template: `
    <button [testMenuTrigger]="animals">Animal Index</button>

    <ng-template #animals>
      <test-menu>
        <button testMenuItem [testMenuTrigger]="vertebrates">Vertebrates</button>
        <button testMenuItem [testMenuTrigger]="invertebrates">Invertebrates</button>
      </test-menu>
    </ng-template>

    <ng-template #vertebrates>
      <test-menu side="right span-bottom">
        <button testMenuItem>Fish</button>
        <button testMenuItem>Amphibians</button>
        <button testMenuItem>Reptiles</button>
        <button testMenuItem>Birds</button>
        <button testMenuItem>Mammals</button>
      </test-menu>
    </ng-template>

    <ng-template #invertebrates>
      <test-menu side="right span-bottom">
        <button testMenuItem>Insects</button>
        <button testMenuItem>Molluscs</button>
        <button testMenuItem>Crustaceans</button>
      </test-menu>
    </ng-template>
  `,
})
export class TestMenuNestedFixture {}
