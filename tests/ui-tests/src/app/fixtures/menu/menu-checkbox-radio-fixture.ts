import {Component, signal} from '@angular/core';
import {
  TestMenu,
  TestMenuCheckboxItem,
  TestMenuGroup,
  TestMenuItem,
  TestMenuRadioGroup,
  TestMenuRadioItem,
  TestMenuSeparator,
  TestMenuTrigger,
} from '../../ui/test-menu';

/**
 * Exercises the stateful menu item primitives:
 *
 *  - `MenuCheckboxItem` — toggles checked state on activate, menu stays open
 *  - `MenuRadioGroup` + `MenuRadioItem` — tracks a single selected value
 *  - `MenuSeparator` / `MenuGroup` — structural + ARIA semantics
 *
 * Two-way bindings on `[(checked)]` and `[(value)]` mirror the state back to
 * component signals so tests can observe reactive updates.
 */
@Component({
  selector: 'test-menu-checkbox-radio-fixture',
  imports: [
    TestMenu,
    TestMenuCheckboxItem,
    TestMenuGroup,
    TestMenuItem,
    TestMenuRadioGroup,
    TestMenuRadioItem,
    TestMenuSeparator,
    TestMenuTrigger,
  ],
  template: `
    <button [testMenuTrigger]="menu">View Options</button>

    <p data-testid="status-bar">status bar: {{ showStatusBar() }}</p>
    <p data-testid="activity-bar">activity bar: {{ showActivityBar() }}</p>
    <p data-testid="panel-position">panel position: {{ panelPosition() }}</p>

    <ng-template #menu>
      <test-menu>
        <div testMenuGroup>
          <button testMenuCheckboxItem [(checked)]="showStatusBar">Status Bar</button>
          <button testMenuCheckboxItem [(checked)]="showActivityBar">Activity Bar</button>
        </div>

        <div testMenuSeparator></div>

        <div testMenuRadioGroup [(value)]="panelPosition">
          <button testMenuRadioItem value="top">Top</button>
          <button testMenuRadioItem value="bottom">Bottom</button>
          <button testMenuRadioItem value="right">Right</button>
        </div>

        <div testMenuSeparator></div>

        <button testMenuItem>Close Menu</button>
      </test-menu>
    </ng-template>
  `,
})
export class TestMenuCheckboxRadioFixture {
  readonly showStatusBar = signal(true);
  readonly showActivityBar = signal(false);
  readonly panelPosition = signal<string | undefined>('bottom');
}
