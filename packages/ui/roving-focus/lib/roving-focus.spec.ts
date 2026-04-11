import {type ComponentFixture} from '@angular/core/testing';
import {Disabler, Orientation, SoftDisabler} from '@terseware/ui/atoms';
import {fireEvent, render, screen} from '@testing-library/angular';
import {RovingFocus} from './roving-focus';
import {RovingFocusItem} from './roving-focus-item';

const IMPORTS = [RovingFocus, RovingFocusItem, Disabler, SoftDisabler, Orientation];

const VERTICAL_TEMPLATE = `
  <div data-testid="group" rovingFocus>
    <button data-testid="item-1" rovingFocusItem disabled softDisabled>Item 1</button>
    <button data-testid="item-2" rovingFocusItem>Item 2</button>
    <button data-testid="item-3" rovingFocusItem disabled softDisabled>Item 3</button>
  </div>
`;

function getItem(n: number): HTMLElement {
  return screen.getByTestId(`item-${n}`);
}

function pressKey(target: HTMLElement, key: string, fixture: ComponentFixture<unknown>): void {
  fireEvent.keyDown(target, {key});
  fixture.detectChanges();
}

function focusItem(n: number, fixture: ComponentFixture<unknown>): void {
  getItem(n).focus();
  fixture.detectChanges();
}

describe('RovingFocus', () => {
  describe('tabindex management', () => {
    it('sets tabindex="-1" on all items initially', async () => {
      await render(VERTICAL_TEMPLATE, {imports: IMPORTS});
      expect(getItem(1)).toHaveAttribute('tabindex', '-1');
      expect(getItem(2)).toHaveAttribute('tabindex', '-1');
      expect(getItem(3)).toHaveAttribute('tabindex', '-1');
    });

    it('sets tabindex="0" on the active item after keyboard navigation', async () => {
      const {fixture} = await render(VERTICAL_TEMPLATE, {imports: IMPORTS});
      focusItem(1, fixture);
      pressKey(getItem(1), 'ArrowDown', fixture);
      fixture.detectChanges();
      expect(getItem(1)).toHaveAttribute('tabindex', '-1');
      expect(getItem(2)).toHaveAttribute('tabindex', '0');
      expect(getItem(3)).toHaveAttribute('tabindex', '-1');
    });

    it('updates tabindex as focus moves through items sequentially', async () => {
      const {fixture} = await render(VERTICAL_TEMPLATE, {imports: IMPORTS});
      focusItem(1, fixture);

      pressKey(getItem(1), 'ArrowDown', fixture);
      fixture.detectChanges();
      expect(getItem(2)).toHaveAttribute('tabindex', '0');

      pressKey(getItem(2), 'ArrowDown', fixture);
      fixture.detectChanges();
      expect(getItem(3)).toHaveAttribute('tabindex', '0');
      expect(getItem(2)).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('vertical navigation', () => {
    it('moves focus to next item on ArrowDown', async () => {
      const {fixture} = await render(VERTICAL_TEMPLATE, {imports: IMPORTS});
      focusItem(1, fixture);
      pressKey(getItem(1), 'ArrowDown', fixture);
      expect(document.activeElement).toBe(getItem(2));
    });

    it('moves focus to previous item on ArrowUp', async () => {
      const {fixture} = await render(VERTICAL_TEMPLATE, {imports: IMPORTS});
      focusItem(2, fixture);
      pressKey(getItem(2), 'ArrowUp', fixture);
      expect(document.activeElement).toBe(getItem(1));
    });

    it('does not move focus on ArrowLeft/ArrowRight in vertical mode', async () => {
      const {fixture} = await render(VERTICAL_TEMPLATE, {imports: IMPORTS});
      focusItem(2, fixture);
      pressKey(getItem(2), 'ArrowRight', fixture);
      expect(document.activeElement).toBe(getItem(2));
      pressKey(getItem(2), 'ArrowLeft', fixture);
      expect(document.activeElement).toBe(getItem(2));
    });

    it('does not preventDefault on off-axis arrow keys', async () => {
      await render(VERTICAL_TEMPLATE, {imports: IMPORTS});
      const el = getItem(2);
      el.focus();

      const event = new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        bubbles: true,
        cancelable: true,
      });
      el.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    });
  });

  describe('horizontal navigation', () => {
    const HORIZONTAL_TEMPLATE = `
      <div data-testid="group" rovingFocus orientation="horizontal">
        <button data-testid="item-1" rovingFocusItem>Item 1</button>
        <button data-testid="item-2" rovingFocusItem>Item 2</button>
        <button data-testid="item-3" rovingFocusItem disabled softDisabled>Item 3</button>
      </div>
    `;

    it('moves focus to next item on ArrowRight', async () => {
      const {fixture} = await render(HORIZONTAL_TEMPLATE, {imports: IMPORTS});
      focusItem(1, fixture);
      pressKey(getItem(1), 'ArrowRight', fixture);
      expect(document.activeElement).toBe(getItem(2));
    });

    it('moves focus to previous item on ArrowLeft', async () => {
      const {fixture} = await render(HORIZONTAL_TEMPLATE, {imports: IMPORTS});
      focusItem(2, fixture);
      pressKey(getItem(2), 'ArrowLeft', fixture);
      expect(document.activeElement).toBe(getItem(1));
    });

    it('does not move focus on ArrowUp/ArrowDown in horizontal mode', async () => {
      const {fixture} = await render(HORIZONTAL_TEMPLATE, {imports: IMPORTS});
      focusItem(1, fixture);
      pressKey(getItem(1), 'ArrowDown', fixture);
      expect(document.activeElement).toBe(getItem(1));
      pressKey(getItem(1), 'ArrowUp', fixture);
      expect(document.activeElement).toBe(getItem(1));
    });
  });

  describe('wrap', () => {
    it('wraps from last to first on ArrowDown', async () => {
      const {fixture} = await render(VERTICAL_TEMPLATE, {imports: IMPORTS});
      focusItem(3, fixture);
      pressKey(getItem(3), 'ArrowDown', fixture);
      expect(document.activeElement).toBe(getItem(1));
    });

    it('wraps from first to last on ArrowUp', async () => {
      const {fixture} = await render(VERTICAL_TEMPLATE, {imports: IMPORTS});
      focusItem(1, fixture);
      pressKey(getItem(1), 'ArrowUp', fixture);
      expect(document.activeElement).toBe(getItem(3));
    });

    it('does not wrap when rovingFocusWrap is false', async () => {
      const {fixture} = await render(
        `
        <div data-testid="group" rovingFocus [rovingFocusWrap]="false">
          <button data-testid="item-1" rovingFocusItem disabled softDisabled>Item 1</button>
          <button data-testid="item-2" rovingFocusItem>Item 2</button>
          <button data-testid="item-3" rovingFocusItem>Item 3</button>
        </div>
      `,
        {imports: IMPORTS},
      );
      focusItem(3, fixture);
      pressKey(getItem(3), 'ArrowDown', fixture);
      expect(document.activeElement).toBe(getItem(3));
    });
  });

  describe('Home/End', () => {
    it('moves focus to first item on Home', async () => {
      const {fixture} = await render(VERTICAL_TEMPLATE, {imports: IMPORTS});
      focusItem(3, fixture);
      pressKey(getItem(3), 'Home', fixture);
      expect(document.activeElement).toBe(getItem(1));
    });

    it('moves focus to last item on End', async () => {
      const {fixture} = await render(VERTICAL_TEMPLATE, {imports: IMPORTS});
      focusItem(1, fixture);
      pressKey(getItem(1), 'End', fixture);
      expect(document.activeElement).toBe(getItem(3));
    });

    it('does not respond to Home/End when rovingFocusHomeEnd is false', async () => {
      const {fixture} = await render(
        `
        <div data-testid="group" rovingFocus [rovingFocusHomeEnd]="false">
          <button data-testid="item-1" rovingFocusItem>Item 1</button>
          <button data-testid="item-2" rovingFocusItem disabled softDisabled>Item 2</button>
          <button data-testid="item-3" rovingFocusItem>Item 3</button>
        </div>
      `,
        {imports: IMPORTS},
      );
      focusItem(2, fixture);
      pressKey(getItem(2), 'Home', fixture);
      expect(document.activeElement).toBe(getItem(2));
      pressKey(getItem(2), 'End', fixture);
      expect(document.activeElement).toBe(getItem(2));
    });

    it('does not preventDefault Home/End when disabled', async () => {
      await render(
        `
        <div data-testid="group" rovingFocus [rovingFocusHomeEnd]="false">
          <button data-testid="item-1" rovingFocusItem>Item 1</button>
          <button data-testid="item-2" rovingFocusItem>Item 2</button>
        </div>
      `,
        {imports: IMPORTS},
      );
      const el = getItem(1);
      el.focus();

      const event = new KeyboardEvent('keydown', {
        key: 'Home',
        bubbles: true,
        cancelable: true,
      });
      el.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    });
  });

  describe('hard-disabled items', () => {
    it('skips hard-disabled items when navigating', async () => {
      const {fixture} = await render(
        `
        <div data-testid="group" rovingFocus>
          <button data-testid="item-1" rovingFocusItem>Item 1</button>
          <button data-testid="item-2" rovingFocusItem disabled>Item 2</button>
          <button data-testid="item-3" rovingFocusItem>Item 3</button>
        </div>
      `,
        {imports: IMPORTS},
      );
      focusItem(1, fixture);
      pressKey(getItem(1), 'ArrowDown', fixture);
      expect(document.activeElement).toBe(getItem(3));
    });

    it('skips hard-disabled items when focusing first', async () => {
      const {fixture} = await render(
        `
        <div data-testid="group" rovingFocus>
          <button data-testid="item-1" rovingFocusItem disabled>Item 1</button>
          <button data-testid="item-2" rovingFocusItem>Item 2</button>
          <button data-testid="item-3" rovingFocusItem disabled softDisabled>Item 3</button>
        </div>
      `,
        {imports: IMPORTS},
      );
      focusItem(3, fixture);
      pressKey(getItem(3), 'ArrowDown', fixture);
      expect(document.activeElement).toBe(getItem(2));
    });

    it('skips hard-disabled items when focusing last via wrap', async () => {
      const {fixture} = await render(
        `
        <div data-testid="group" rovingFocus>
          <button data-testid="item-1" rovingFocusItem disabled softDisabled>Item 1</button>
          <button data-testid="item-2" rovingFocusItem>Item 2</button>
          <button data-testid="item-3" rovingFocusItem disabled>Item 3</button>
        </div>
      `,
        {imports: IMPORTS},
      );
      focusItem(1, fixture);
      pressKey(getItem(1), 'ArrowUp', fixture);
      expect(document.activeElement).toBe(getItem(2));
    });

    it('skips hard-disabled items when calling focusFirst via Home', async () => {
      const {fixture} = await render(
        `
        <div data-testid="group" rovingFocus>
          <button data-testid="item-1" rovingFocusItem disabled>Item 1</button>
          <button data-testid="item-2" rovingFocusItem>Item 2</button>
          <button data-testid="item-3" rovingFocusItem>Item 3</button>
        </div>
      `,
        {imports: IMPORTS},
      );
      focusItem(3, fixture);
      pressKey(getItem(3), 'Home', fixture);
      expect(document.activeElement).toBe(getItem(2));
    });

    it('skips hard-disabled items when calling focusLast via End', async () => {
      const {fixture} = await render(
        `
        <div data-testid="group" rovingFocus>
          <button data-testid="item-1" rovingFocusItem>Item 1</button>
          <button data-testid="item-2" rovingFocusItem>Item 2</button>
          <button data-testid="item-3" rovingFocusItem disabled>Item 3</button>
        </div>
      `,
        {imports: IMPORTS},
      );
      focusItem(1, fixture);
      pressKey(getItem(1), 'End', fixture);
      expect(document.activeElement).toBe(getItem(2));
    });
  });

  describe('soft-disabled items', () => {
    it('keeps soft-disabled items in the navigation order', async () => {
      const {fixture} = await render(VERTICAL_TEMPLATE, {imports: IMPORTS});
      focusItem(2, fixture);
      pressKey(getItem(2), 'ArrowDown', fixture);
      // item 3 is soft-disabled — it should still receive focus
      expect(document.activeElement).toBe(getItem(3));
    });
  });

  describe('enabled', () => {
    it('ignores arrow keys when the group is disabled', async () => {
      const {fixture} = await render(
        `
        <div data-testid="group" rovingFocus [rovingFocus]="false">
          <button data-testid="item-1" rovingFocusItem>Item 1</button>
          <button data-testid="item-2" rovingFocusItem>Item 2</button>
        </div>
      `,
        {imports: IMPORTS},
      );
      focusItem(1, fixture);
      pressKey(getItem(1), 'ArrowDown', fixture);
      expect(document.activeElement).toBe(getItem(1));
    });

    it('ignores Home/End when the group is disabled', async () => {
      const {fixture} = await render(
        `
        <div data-testid="group" rovingFocus [rovingFocus]="false">
          <button data-testid="item-1" rovingFocusItem>Item 1</button>
          <button data-testid="item-2" rovingFocusItem>Item 2</button>
        </div>
      `,
        {imports: IMPORTS},
      );
      focusItem(2, fixture);
      pressKey(getItem(2), 'Home', fixture);
      expect(document.activeElement).toBe(getItem(2));
    });
  });

  describe('empty group', () => {
    it('does not throw when navigating an empty group', async () => {
      const {fixture} = await render(`<div data-testid="group" rovingFocus></div>`, {
        imports: IMPORTS,
      });
      const group = screen.getByTestId('group');
      group.tabIndex = 0;
      group.focus();

      expect(() => pressKey(group, 'ArrowDown', fixture)).not.toThrow();
      expect(() => pressKey(group, 'Home', fixture)).not.toThrow();
      expect(() => pressKey(group, 'End', fixture)).not.toThrow();
    });
  });
});
