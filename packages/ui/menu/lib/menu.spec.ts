import {Component, Directive} from '@angular/core';
import {type ComponentFixture} from '@angular/core/testing';
import {fireEvent, render, screen} from '@testing-library/angular';
import {Menu} from './menu';
import {MenuItem} from './menu-item';
import {MenuTrigger} from './menu-trigger';

@Directive({
  selector: '[testMenuTrigger]',
  hostDirectives: [
    {
      directive: MenuTrigger,
      inputs: ['menuTriggerFor:testMenuTrigger'],
    },
  ],
})
class TestMenuTrigger {}

@Directive({
  selector: '[testMenu]',
  hostDirectives: [Menu],
})
class TestMenu {}

@Directive({
  selector: '[testMenuItem]',
  hostDirectives: [MenuItem],
})
class TestMenuItem {}

@Component({
  selector: 'test-menu-host',
  imports: [TestMenuTrigger, TestMenu, TestMenuItem],
  template: `
    <button data-testid="trigger" [testMenuTrigger]="menu">Open Menu</button>
    <ng-template #menu>
      <div data-testid="menu" testMenu>
        <button data-testid="item-apple" testMenuItem>Apple</button>
        <button data-testid="item-banana" testMenuItem>Banana</button>
        <button data-testid="item-cherry" testMenuItem>Cherry</button>
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
    it('should set aria-haspopup="menu" on trigger', async () => {
      await render(TestMenuHost);
      expect(getTrigger()).toHaveAttribute('aria-haspopup', 'menu');
    });

    it('should set aria-expanded="false" when menu is closed', async () => {
      await render(TestMenuHost);
      expect(getTrigger()).toHaveAttribute('aria-expanded', 'false');
    });

    it('should set aria-expanded="true" when menu is open', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);
      expect(getTrigger()).toHaveAttribute('aria-expanded', 'true');
    });

    it('should set data-open on trigger when menu is open', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);
      expect(getTrigger()).toHaveAttribute('data-open');
    });

    it('should set data-closed on trigger when menu is closed', async () => {
      await render(TestMenuHost);
      expect(getTrigger()).toHaveAttribute('data-closed');
      expect(getTrigger()).not.toHaveAttribute('data-open');
    });

    it('should set role="menu" on the menu container', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);
      expect(getMenu()).toHaveAttribute('role', 'menu');
    });

    it('should set role="menuitem" on menu items', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);
      const items = getItems();
      expect(items).toHaveLength(3);
      for (const item of items) {
        expect(item).toHaveAttribute('role', 'menuitem');
      }
    });

    it('should set aria-controls on trigger referencing the menu id', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);
      const menuId = getMenu().getAttribute('id');
      expect(menuId).toBeTruthy();
      expect(getTrigger().getAttribute('aria-controls')).toContain(menuId);
    });
  });

  describe('open/close', () => {
    it('should open the menu on trigger click', async () => {
      const {fixture} = await render(TestMenuHost);
      expect(queryMenu()).not.toBeInTheDocument();
      openMenu(fixture);
      expect(queryMenu()).toBeInTheDocument();
    });

    it('should close the menu when clicking trigger again', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);
      expect(queryMenu()).toBeInTheDocument();
      openMenu(fixture);
      expect(queryMenu()).not.toBeInTheDocument();
    });

    it('should close the menu on Escape', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);
      expect(queryMenu()).toBeInTheDocument();

      pressKey(getMenu(), 'Escape', fixture);
      expect(queryMenu()).not.toBeInTheDocument();
    });

    it('should close the menu when clicking a menu item', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);

      fireEvent.click(getItem('Apple'));
      fixture.detectChanges();
      expect(queryMenu()).not.toBeInTheDocument();
    });

    it('should close the menu on Tab', async () => {
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
  });

  describe('keyboard navigation', () => {
    it('should open and focus first item on ArrowDown from trigger', async () => {
      const {fixture} = await render(TestMenuHost);
      getTrigger().focus();
      pressKey(getTrigger(), 'ArrowDown', fixture);

      expect(queryMenu()).toBeInTheDocument();
      expect(document.activeElement).toBe(getItem('Apple'));
    });

    it('should open and focus last item on ArrowUp from trigger', async () => {
      const {fixture} = await render(TestMenuHost);
      getTrigger().focus();
      pressKey(getTrigger(), 'ArrowUp', fixture);

      expect(queryMenu()).toBeInTheDocument();
      expect(document.activeElement).toBe(getItem('Cherry'));
    });

    it('should move focus down with ArrowDown', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);

      // Focus Banana first, then navigate down to Cherry
      const banana = getItem('Banana');
      banana.focus();
      fixture.detectChanges();
      pressKey(banana, 'ArrowDown', fixture);
      expect(document.activeElement).toBe(getItem('Cherry'));
    });

    it('should move focus up with ArrowUp', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);

      const banana = getItem('Banana');
      banana.focus();
      fixture.detectChanges();
      pressKey(banana, 'ArrowUp', fixture);
      expect(document.activeElement).toBe(getItem('Apple'));
    });

    it('should wrap focus from last to first on ArrowDown', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);

      const cherry = getItem('Cherry');
      cherry.focus();
      fixture.detectChanges();
      pressKey(cherry, 'ArrowDown', fixture);
      expect(document.activeElement).toBe(getItem('Apple'));
    });

    it('should wrap focus from first to last on ArrowUp', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);

      // Focus Banana, navigate up to Apple, then up again to wrap to Cherry
      const banana = getItem('Banana');
      banana.focus();
      fixture.detectChanges();
      pressKey(banana, 'ArrowUp', fixture);
      expect(document.activeElement).toBe(getItem('Apple'));

      pressKey(getItem('Apple'), 'ArrowUp', fixture);
      expect(document.activeElement).toBe(getItem('Cherry'));
    });

    it('should move focus to first item on Home', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);

      const cherry = getItem('Cherry');
      cherry.focus();
      fixture.detectChanges();
      pressKey(cherry, 'Home', fixture);
      expect(document.activeElement).toBe(getItem('Apple'));
    });

    it('should move focus to last item on End', async () => {
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
    it('should focus the first item when menu opens via click', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);

      expect(document.activeElement).toBe(getItem('Apple'));
    });

    it('should return focus to trigger when menu closes via Escape', async () => {
      const {fixture} = await render(TestMenuHost);
      getTrigger().focus();
      openMenu(fixture);

      pressKey(getMenu(), 'Escape', fixture);
      expect(document.activeElement).toBe(getTrigger());
    });

    it('should return focus to trigger when menu closes via item click', async () => {
      const {fixture} = await render(TestMenuHost);
      getTrigger().focus();
      openMenu(fixture);

      fireEvent.click(getItem('Banana'));
      fixture.detectChanges();
      expect(document.activeElement).toBe(getTrigger());
    });

    it('should return focus to trigger when menu closes via Tab', async () => {
      const {fixture} = await render(TestMenuHost);
      getTrigger().focus();
      openMenu(fixture);

      pressKey(getMenu(), 'Tab', fixture);
      expect(document.activeElement).toBe(getTrigger());
    });
  });

  describe('item activation via keyboard', () => {
    it('should activate an item on Enter and close the menu', async () => {
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

    it('should activate an item on Space and close the menu', async () => {
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

    it('should return focus to trigger after activating item with Enter', async () => {
      const {fixture} = await render(TestMenuHost);
      getTrigger().focus();
      openMenu(fixture);

      const banana = getItem('Banana');
      banana.focus();
      fixture.detectChanges();

      pressKey(banana, 'Enter', fixture);
      expect(document.activeElement).toBe(getTrigger());
    });

    it('should return focus to trigger after activating item with Space', async () => {
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
    it('should focus an item matching a typed character', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);

      pressKey(getMenu(), 'b', fixture);
      expect(document.activeElement).toBe(getItem('Banana'));
    });

    it('should focus an item matching multiple typed characters', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);

      pressKey(getMenu(), 'c', fixture);
      pressKey(getMenu(), 'h', fixture);
      expect(document.activeElement).toBe(getItem('Cherry'));
    });

    it('should reset the search buffer after timeout', async () => {
      vi.useFakeTimers();
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);

      pressKey(getMenu(), 'b', fixture);
      expect(document.activeElement).toBe(getItem('Banana'));

      vi.advanceTimersByTime(Menu.TYPEAHEAD_RESET_MS + 1);

      // After reset, typing 'a' should match Apple, not continue "ba..."
      pressKey(getMenu(), 'a', fixture);
      expect(document.activeElement).toBe(getItem('Apple'));

      vi.useRealTimers();
    });

    it('should be case-insensitive', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);

      pressKey(getMenu(), 'C', fixture);
      expect(document.activeElement).toBe(getItem('Cherry'));
    });

    it('should not trigger typeahead with modifier keys', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);

      const apple = getItem('Apple');
      apple.focus();

      pressKey(getMenu(), 'b', fixture, {ctrlKey: true});
      // Should NOT have moved to Banana
      expect(document.activeElement).toBe(apple);
    });
  });

  describe('data-highlighted', () => {
    it('should set data-highlighted on focused item', async () => {
      const {fixture} = await render(TestMenuHost);
      openMenu(fixture);

      const banana = getItem('Banana');
      banana.focus();
      fixture.detectChanges();
      expect(banana).toHaveAttribute('data-highlighted');
      expect(getItem('Apple')).not.toHaveAttribute('data-highlighted');
    });

    it('should move data-highlighted with arrow keys', async () => {
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
