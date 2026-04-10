import {expect, test, type Page} from '@playwright/test';

/**
 * Stateful menu item e2e tests for `@terseware/ui/menu`:
 *
 *  - `MenuCheckboxItem` — toggle state on click/Enter/Space, menu stays open
 *  - `MenuRadioGroup` + `MenuRadioItem` — exclusive selection, value binding
 *  - `MenuSeparator` / `MenuGroup` — ARIA role contract, not focusable
 *
 * Fixture: tests/ui-tests/src/app/fixtures/menu/menu-checkbox-radio-fixture.ts
 */
test.describe('menu checkbox + radio', () => {
  const openMenu = async (page: Page) => {
    await page.getByRole('button', {name: 'View Options'}).click();
    await expect(page.getByRole('menu')).toBeVisible();
  };

  test.beforeEach(async ({page}) => {
    await page.goto('/menu-checkbox-radio');
  });

  // ---------------------------------------------------------------------------
  // Structure / ARIA
  // ---------------------------------------------------------------------------
  test.describe('structure', () => {
    test('menu has the expected role layout', async ({page}) => {
      await openMenu(page);

      // 2 checkbox items + 3 radio items + 1 regular item = 0 menuitem;
      // role-specific roles take precedence
      await expect(page.getByRole('menuitemcheckbox')).toHaveCount(2);
      await expect(page.getByRole('menuitemradio')).toHaveCount(3);
      await expect(page.getByRole('menuitem')).toHaveCount(1);
      await expect(page.getByRole('separator')).toHaveCount(2);
      await expect(page.getByRole('group')).toHaveCount(2); // item group + radio group
    });

    test('separators are not focusable via roving focus', async ({page}) => {
      await openMenu(page);

      const separators = page.getByRole('separator');
      for (let i = 0; i < (await separators.count()); i++) {
        const tabindex = await separators.nth(i).getAttribute('tabindex');
        expect(tabindex).toBeNull();
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Checkbox items
  // ---------------------------------------------------------------------------
  test.describe('checkbox item', () => {
    test('initial aria-checked reflects the bound model', async ({page}) => {
      await openMenu(page);

      const statusBar = page.getByRole('menuitemcheckbox', {name: 'Status Bar'});
      const activityBar = page.getByRole('menuitemcheckbox', {name: 'Activity Bar'});

      // Component initializes Status Bar = true, Activity Bar = false
      await expect(statusBar).toHaveAttribute('aria-checked', 'true');
      await expect(statusBar).toHaveAttribute('data-checked', '');
      await expect(activityBar).toHaveAttribute('aria-checked', 'false');
      await expect(activityBar).toHaveAttribute('data-unchecked', '');
    });

    test('clicking a checkbox item toggles state and keeps the menu open', async ({page}) => {
      await openMenu(page);

      const activityBar = page.getByRole('menuitemcheckbox', {name: 'Activity Bar'});
      await expect(activityBar).toHaveAttribute('aria-checked', 'false');

      await activityBar.click();

      // Menu stays open, aria-checked flipped to true, bound signal updated
      await expect(page.getByRole('menu')).toBeVisible();
      await expect(activityBar).toHaveAttribute('aria-checked', 'true');
      await expect(page.getByTestId('activity-bar')).toHaveText('activity bar: true');
    });

    test('Enter on a focused checkbox item toggles without closing', async ({page}) => {
      await openMenu(page);

      // First item in the menu is Status Bar — it's the initial focus target
      const statusBar = page.getByRole('menuitemcheckbox', {name: 'Status Bar'});
      await expect(statusBar).toBeFocused();
      await expect(statusBar).toHaveAttribute('aria-checked', 'true');

      await page.keyboard.press('Enter');

      await expect(page.getByRole('menu')).toBeVisible();
      await expect(statusBar).toHaveAttribute('aria-checked', 'false');
      await expect(statusBar).toBeFocused();
      await expect(page.getByTestId('status-bar')).toHaveText('status bar: false');
    });

    test('clicking a regular menu item still closes the menu', async ({page}) => {
      await openMenu(page);
      await page.getByRole('menuitem', {name: 'Close Menu'}).click();
      await expect(page.getByRole('menu')).toBeHidden();
    });
  });

  // ---------------------------------------------------------------------------
  // Radio items
  // ---------------------------------------------------------------------------
  test.describe('radio item', () => {
    test('initial aria-checked matches the group value', async ({page}) => {
      await openMenu(page);

      // Component initializes panelPosition = 'bottom'
      const top = page.getByRole('menuitemradio', {name: 'Top'});
      const bottom = page.getByRole('menuitemradio', {name: 'Bottom'});
      const right = page.getByRole('menuitemradio', {name: 'Right'});

      await expect(top).toHaveAttribute('aria-checked', 'false');
      await expect(bottom).toHaveAttribute('aria-checked', 'true');
      await expect(bottom).toHaveAttribute('data-checked', '');
      await expect(right).toHaveAttribute('aria-checked', 'false');
    });

    test('clicking a radio item updates the group value exclusively', async ({page}) => {
      await openMenu(page);

      const top = page.getByRole('menuitemradio', {name: 'Top'});
      const bottom = page.getByRole('menuitemradio', {name: 'Bottom'});
      const right = page.getByRole('menuitemradio', {name: 'Right'});

      await right.click();

      // Menu stays open
      await expect(page.getByRole('menu')).toBeVisible();

      // Exclusive selection: only `right` is aria-checked="true"
      await expect(top).toHaveAttribute('aria-checked', 'false');
      await expect(bottom).toHaveAttribute('aria-checked', 'false');
      await expect(right).toHaveAttribute('aria-checked', 'true');

      // Bound signal updated
      await expect(page.getByTestId('panel-position')).toHaveText('panel position: right');
    });

    test('radio items stay focusable via keyboard (they pass through roving focus)', async ({
      page,
    }) => {
      await openMenu(page);

      // Walk down to a radio item and activate with Space
      // First item is Status Bar. Reach "Top" (first radio item) via ArrowDown
      // past Status Bar → Activity Bar → Top
      await page.keyboard.press('ArrowDown'); // Activity Bar
      await page.keyboard.press('ArrowDown'); // Top
      const top = page.getByRole('menuitemradio', {name: 'Top'});
      await expect(top).toBeFocused();

      await page.keyboard.press(' ');

      await expect(page.getByRole('menu')).toBeVisible();
      await expect(top).toHaveAttribute('aria-checked', 'true');
      await expect(page.getByTestId('panel-position')).toHaveText('panel position: top');
    });
  });
});
