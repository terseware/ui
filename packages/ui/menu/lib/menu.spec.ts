import {Component} from '@angular/core';
import {type ComponentFixture} from '@angular/core/testing';
import {fireEvent, render, screen} from '@testing-library/angular';
import {Menu} from './menu';
import {MenuItem} from './menu-item';
import {MenuTrigger} from './menu-trigger';

@Component({
  selector: 'test-menu-host',
  imports: [MenuTrigger, Menu, MenuItem],
  template: `
    <button data-testid="trigger" menuTrigger [menuTriggerFor]="menuTpl">Open Menu</button>
    <ng-template #menuTpl>
      <div data-testid="menu" menu>
        <button data-testid="item-apple" menuItem>Apple</button>
        <button data-testid="item-banana" menuItem>Banana</button>
        <button data-testid="item-cherry" menuItem>Cherry</button>
      </div>
    </ng-template>
    <button data-testid="outside">Outside</button>
  `,
})
class TestMenuHost {}

// --- Helpers ---

function getTrigger(): HTMLElement {
  return screen.getByTestId('trigger');
}

function queryMenu(): HTMLElement | null {
  return screen.queryByTestId('menu');
}

function getMenu(): HTMLElement {
  return screen.getByTestId('menu');
}

function getItems(): HTMLElement[] {
  return screen.getAllByRole('menuitem');
}

function getItem(name: string): HTMLElement {
  return screen.getByRole('menuitem', {name});
}

function openMenu(fixture: ComponentFixture<unknown>): void {
  fireEvent.mouseDown(getTrigger());
  fixture.detectChanges();
}

function pressKey(
  target: HTMLElement,
  key: string,
  fixture: ComponentFixture<unknown>,
  opts: Record<string, unknown> = {},
): void {
  fireEvent.keyDown(target, {key, ...opts});
  fixture.detectChanges();
}

// --- Tests ---

describe('Menu', () => {
  describe('ARIA attributes', () => {
    it('sets aria-haspopup="menu" on trigger', async () => {
      await render(TestMenuHost);
      expect(getTrigger()).toHaveAttribute('aria-haspopup', 'menu');
    });

    it('sets aria-expanded="false" when menu is closed', async () => {
      await render(TestMenuHost);
      expect(getTrigger()).toHaveAttribute('aria-expanded', 'false');
    });

    it('sets aria-expanded="true" when menu is open', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);
      expect(getTrigger()).toHaveAttribute('aria-expanded', 'true');
    });

    it('sets data-opened on trigger when menu is open', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);
      expect(getTrigger()).toHaveAttribute('data-opened');
    });

    it('sets data-closed on trigger when menu is closed', async () => {
      await render(TestMenuHost);
      expect(getTrigger()).toHaveAttribute('data-closed');
      expect(getTrigger()).not.toHaveAttribute('data-opened');
    });

    it('sets role="menu" on the menu container', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);
      expect(getMenu()).toHaveAttribute('role', 'menu');
    });

    it('sets role="menuitem" on menu items', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);
      const items = getItems();
      expect(items).toHaveLength(3);
      for (const item of items) {
        expect(item).toHaveAttribute('role', 'menuitem');
      }
    });

    it('sets aria-controls on trigger referencing the menu id', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);
      const menuId = getMenu().getAttribute('id');
      expect(menuId).toBeTruthy();
      expect(getTrigger().getAttribute('aria-controls')).toContain(menuId);
    });
  });

  describe('open/close', () => {
    it('opens the menu on trigger mousedown', async () => {
      const {fixture} = await render(TestMenuHost);
      expect(queryMenu()).not.toBeInTheDocument();
      openMenu(fixture);
      expect(queryMenu()).toBeInTheDocument();
    });

    it('closes the menu when mousedown fires on an already-open trigger', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);
      expect(queryMenu()).toBeInTheDocument();
      openMenu(fixture);
      expect(queryMenu()).not.toBeInTheDocument();
    });

    it('closes the menu on Escape', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);
      expect(queryMenu()).toBeInTheDocument();

      pressKey(getMenu(), 'Escape', fixture);
      expect(queryMenu()).not.toBeInTheDocument();
    });

    it('closes the menu when clicking a menu item', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);

      fireEvent.click(getItem('Apple'));
      fixture.detectChanges();
      expect(queryMenu()).not.toBeInTheDocument();
    });

    it('closes the menu on Tab and preventDefaults the tab', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);
      expect(queryMenu()).toBeInTheDocument();

      const event = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true,
      });
      getMenu().dispatchEvent(event);
      fixture.detectChanges();

      expect(event.defaultPrevented).toBe(true);
      expect(queryMenu()).not.toBeInTheDocument();
    });

    it('does not preventDefault Escape on a closed trigger', async () => {
      // Gate test for the `when` predicate on the trigger's Escape binding.
      await render(TestMenuHost);
      const trigger = getTrigger();
      trigger.focus();

      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      });
      trigger.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    });
  });

  describe('keyboard navigation', () => {
    it('opens and focuses first item on ArrowDown from trigger', async () => {
      const {fixture} = await render(TestMenuHost);
      getTrigger().focus();
      pressKey(getTrigger(), 'ArrowDown', fixture);

      expect(queryMenu()).toBeInTheDocument();
      expect(document.activeElement).toBe(getItem('Apple'));
    });

    it('opens and focuses last item on ArrowUp from trigger', async () => {
      const {fixture} = await render(TestMenuHost);
      getTrigger().focus();
      pressKey(getTrigger(), 'ArrowUp', fixture);

      expect(queryMenu()).toBeInTheDocument();
      expect(document.activeElement).toBe(getItem('Cherry'));
    });

    it('moves focus down with ArrowDown', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);

      const banana = getItem('Banana');
      banana.focus();
      fixture.detectChanges();
      pressKey(banana, 'ArrowDown', fixture);
      expect(document.activeElement).toBe(getItem('Cherry'));
    });

    it('moves focus up with ArrowUp', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);

      const banana = getItem('Banana');
      banana.focus();
      fixture.detectChanges();
      pressKey(banana, 'ArrowUp', fixture);
      expect(document.activeElement).toBe(getItem('Apple'));
    });

    it('wraps focus from last to first on ArrowDown', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);

      const cherry = getItem('Cherry');
      cherry.focus();
      fixture.detectChanges();
      pressKey(cherry, 'ArrowDown', fixture);
      expect(document.activeElement).toBe(getItem('Apple'));
    });

    it('wraps focus from first to last on ArrowUp', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);

      const apple = getItem('Apple');
      apple.focus();
      fixture.detectChanges();
      pressKey(apple, 'ArrowUp', fixture);
      expect(document.activeElement).toBe(getItem('Cherry'));
    });

    it('moves focus to first item on Home', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);

      const cherry = getItem('Cherry');
      cherry.focus();
      fixture.detectChanges();
      pressKey(cherry, 'Home', fixture);
      expect(document.activeElement).toBe(getItem('Apple'));
    });

    it('moves focus to last item on End', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);

      const apple = getItem('Apple');
      apple.focus();
      fixture.detectChanges();
      pressKey(apple, 'End', fixture);
      expect(document.activeElement).toBe(getItem('Cherry'));
    });
  });

  describe('focus management', () => {
    it('focuses the first item when menu opens via click', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);
      expect(document.activeElement).toBe(getItem('Apple'));
    });

    it('returns focus to trigger when menu closes via Escape', async () => {
      const {fixture} = await render(TestMenuHost);
      getTrigger().focus();
      openMenu(fixture);

      pressKey(getMenu(), 'Escape', fixture);
      expect(document.activeElement).toBe(getTrigger());
    });

    it('returns focus to trigger when menu closes via item click', async () => {
      const {fixture} = await render(TestMenuHost);
      getTrigger().focus();
      openMenu(fixture);

      fireEvent.click(getItem('Banana'));
      fixture.detectChanges();
      expect(document.activeElement).toBe(getTrigger());
    });

    it('returns focus to trigger when menu closes via Tab', async () => {
      const {fixture} = await render(TestMenuHost);
      getTrigger().focus();
      openMenu(fixture);

      pressKey(getMenu(), 'Tab', fixture);
      expect(document.activeElement).toBe(getTrigger());
    });
  });

  describe('item activation via keyboard', () => {
    it('activates an item on Enter and closes the menu', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);

      const banana = getItem('Banana');
      banana.focus();
      fixture.detectChanges();

      const clickSpy = vi.fn();
      banana.addEventListener('click', clickSpy);

      pressKey(banana, 'Enter', fixture);

      expect(clickSpy).toHaveBeenCalled();
      expect(queryMenu()).not.toBeInTheDocument();
    });

    it('activates an item on Space and closes the menu', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);

      const banana = getItem('Banana');
      banana.focus();
      fixture.detectChanges();

      const clickSpy = vi.fn();
      banana.addEventListener('click', clickSpy);

      pressKey(banana, ' ', fixture);

      expect(clickSpy).toHaveBeenCalled();
      expect(queryMenu()).not.toBeInTheDocument();
    });

    it('returns focus to trigger after activating item with Enter', async () => {
      const {fixture} = await render(TestMenuHost);
      getTrigger().focus();
      openMenu(fixture);

      const banana = getItem('Banana');
      banana.focus();
      fixture.detectChanges();

      pressKey(banana, 'Enter', fixture);
      expect(document.activeElement).toBe(getTrigger());
    });

    it('returns focus to trigger after activating item with Space', async () => {
      const {fixture} = await render(TestMenuHost);
      getTrigger().focus();
      openMenu(fixture);

      const banana = getItem('Banana');
      banana.focus();
      fixture.detectChanges();

      pressKey(banana, ' ', fixture);
      expect(document.activeElement).toBe(getTrigger());
    });
  });

  describe('typeahead', () => {
    it('focuses an item matching a typed character', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);

      pressKey(getMenu(), 'b', fixture);
      expect(document.activeElement).toBe(getItem('Banana'));
    });

    it('focuses an item matching multiple typed characters', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);

      pressKey(getMenu(), 'c', fixture);
      pressKey(getMenu(), 'h', fixture);
      expect(document.activeElement).toBe(getItem('Cherry'));
    });

    it('resets the search buffer after timeout', async () => {
      vi.useFakeTimers();
      try {
        const {fixture} = await render(TestMenuHost);
        openMenu(fixture);

        pressKey(getMenu(), 'b', fixture);
        expect(document.activeElement).toBe(getItem('Banana'));

        vi.advanceTimersByTime(Menu.TYPEAHEAD_RESET_MS + 1);

        // After reset, typing 'a' matches Apple, not "ba..."
        pressKey(getMenu(), 'a', fixture);
        expect(document.activeElement).toBe(getItem('Apple'));
      } finally {
        vi.useRealTimers();
      }
    });

    it('is case-insensitive', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);

      pressKey(getMenu(), 'C', fixture);
      expect(document.activeElement).toBe(getItem('Cherry'));
    });

    it('does not trigger typeahead with modifier keys held', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);

      const apple = getItem('Apple');
      apple.focus();

      pressKey(getMenu(), 'b', fixture, {ctrlKey: true});
      expect(document.activeElement).toBe(apple);
    });
  });

  describe('data-highlighted', () => {
    it('sets data-highlighted on focused item', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);

      const banana = getItem('Banana');
      banana.focus();
      fixture.detectChanges();
      expect(banana).toHaveAttribute('data-highlighted');
      expect(getItem('Apple')).not.toHaveAttribute('data-highlighted');
    });

    it('moves data-highlighted with arrow keys', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);

      const banana = getItem('Banana');
      banana.focus();
      fixture.detectChanges();
      expect(banana).toHaveAttribute('data-highlighted');

      pressKey(banana, 'ArrowDown', fixture);
      const cherry = getItem('Cherry');
      expect(cherry).toHaveAttribute('data-highlighted');
      expect(banana).not.toHaveAttribute('data-highlighted');
    });
  });
});
