import {Directive} from '@angular/core';
import {type ComponentFixture} from '@angular/core/testing';
import {Disabled} from '@terseware/ui/atoms';
import {fireEvent, render, screen} from '@testing-library/angular';
import {RovingFocus} from './roving-focus';
import {RovingFocusItem} from './roving-focus-item';

@Directive({
  selector: '[testRovingGroup]',
  hostDirectives: [
    RovingFocus,
    {
      directive: RovingFocus,
      inputs: [
        'rovingFocusOrientation:testRovingGroupOrientation',
        'rovingFocusWrap:testRovingGroupWrap',
        'rovingFocusHomeEnd:testRovingGroupHomeEnd',
      ],
    },
  ],
})
class TestRovingGroup {}

@Directive({
  selector: '[testRovingItem]',
  hostDirectives: [
    RovingFocusItem,
    {
      directive: Disabled,
      inputs: ['hardDisabled:testRovingItemDisabled', 'softDisabled:testRovingItemSoftDisabled'],
    },
  ],
})
class TestRovingItem {}

const VERTICAL_TEMPLATE = `
  <div data-testid="group" testRovingGroup>
    <button data-testid="item-1" testRovingItem>Item 1</button>
    <button data-testid="item-2" testRovingItem>Item 2</button>
    <button data-testid="item-3" testRovingItem>Item 3</button>
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
    it('should set tabindex="-1" on all items initially', async () => {
      await render(VERTICAL_TEMPLATE, {imports: [TestRovingGroup, TestRovingItem]});
      expect(getItem(1)).toHaveAttribute('tabindex', '-1');
      expect(getItem(2)).toHaveAttribute('tabindex', '-1');
      expect(getItem(3)).toHaveAttribute('tabindex', '-1');
    });

    it('should set tabindex="0" on the active item after keyboard navigation', async () => {
      const {fixture} = await render(VERTICAL_TEMPLATE, {
        imports: [TestRovingGroup, TestRovingItem],
      });
      // Focus item 1 and navigate down to item 2
      focusItem(1, fixture);
      pressKey(getItem(1), 'ArrowDown', fixture);
      fixture.detectChanges();
      expect(getItem(1)).toHaveAttribute('tabindex', '-1');
      expect(getItem(2)).toHaveAttribute('tabindex', '0');
      expect(getItem(3)).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('vertical navigation', () => {
    it('should move focus to next item on ArrowDown', async () => {
      const {fixture} = await render(VERTICAL_TEMPLATE, {
        imports: [TestRovingGroup, TestRovingItem],
      });
      focusItem(1, fixture);
      pressKey(getItem(1), 'ArrowDown', fixture);
      expect(document.activeElement).toBe(getItem(2));
    });

    it('should move focus to previous item on ArrowUp', async () => {
      const {fixture} = await render(VERTICAL_TEMPLATE, {
        imports: [TestRovingGroup, TestRovingItem],
      });
      focusItem(2, fixture);
      pressKey(getItem(2), 'ArrowUp', fixture);
      expect(document.activeElement).toBe(getItem(1));
    });

    it('should not move focus on ArrowLeft/ArrowRight in vertical mode', async () => {
      const {fixture} = await render(VERTICAL_TEMPLATE, {
        imports: [TestRovingGroup, TestRovingItem],
      });
      focusItem(1, fixture);
      pressKey(getItem(1), 'ArrowRight', fixture);
      expect(document.activeElement).toBe(getItem(1));
      pressKey(getItem(1), 'ArrowLeft', fixture);
      expect(document.activeElement).toBe(getItem(1));
    });
  });

  describe('horizontal navigation', () => {
    const HORIZONTAL_TEMPLATE = `
      <div data-testid="group" testRovingGroup testRovingGroupOrientation="horizontal">
        <button data-testid="item-1" testRovingItem>Item 1</button>
        <button data-testid="item-2" testRovingItem>Item 2</button>
        <button data-testid="item-3" testRovingItem>Item 3</button>
      </div>
    `;

    it('should move focus to next item on ArrowRight', async () => {
      const {fixture} = await render(HORIZONTAL_TEMPLATE, {
        imports: [TestRovingGroup, TestRovingItem],
      });
      focusItem(1, fixture);
      pressKey(getItem(1), 'ArrowRight', fixture);
      expect(document.activeElement).toBe(getItem(2));
    });

    it('should move focus to previous item on ArrowLeft', async () => {
      const {fixture} = await render(HORIZONTAL_TEMPLATE, {
        imports: [TestRovingGroup, TestRovingItem],
      });
      focusItem(2, fixture);
      pressKey(getItem(2), 'ArrowLeft', fixture);
      expect(document.activeElement).toBe(getItem(1));
    });

    it('should not move focus on ArrowUp/ArrowDown in horizontal mode', async () => {
      const {fixture} = await render(HORIZONTAL_TEMPLATE, {
        imports: [TestRovingGroup, TestRovingItem],
      });
      focusItem(1, fixture);
      pressKey(getItem(1), 'ArrowDown', fixture);
      expect(document.activeElement).toBe(getItem(1));
      pressKey(getItem(1), 'ArrowUp', fixture);
      expect(document.activeElement).toBe(getItem(1));
    });
  });

  describe('wrap', () => {
    it('should wrap from last to first on ArrowDown', async () => {
      const {fixture} = await render(VERTICAL_TEMPLATE, {
        imports: [TestRovingGroup, TestRovingItem],
      });
      focusItem(3, fixture);
      pressKey(getItem(3), 'ArrowDown', fixture);
      expect(document.activeElement).toBe(getItem(1));
    });

    it('should wrap from first to last on ArrowUp', async () => {
      const {fixture} = await render(VERTICAL_TEMPLATE, {
        imports: [TestRovingGroup, TestRovingItem],
      });
      focusItem(1, fixture);
      pressKey(getItem(1), 'ArrowUp', fixture);
      expect(document.activeElement).toBe(getItem(3));
    });

    it('should not wrap when wrap is disabled', async () => {
      const {fixture} = await render(
        `
        <div data-testid="group" testRovingGroup [testRovingGroupWrap]="false">
          <button data-testid="item-1" testRovingItem>Item 1</button>
          <button data-testid="item-2" testRovingItem>Item 2</button>
          <button data-testid="item-3" testRovingItem>Item 3</button>
        </div>
      `,
        {imports: [TestRovingGroup, TestRovingItem]},
      );
      focusItem(3, fixture);
      pressKey(getItem(3), 'ArrowDown', fixture);
      // Should stay on last item, not wrap
      expect(document.activeElement).toBe(getItem(3));
    });
  });

  describe('Home/End', () => {
    it('should move focus to first item on Home', async () => {
      const {fixture} = await render(VERTICAL_TEMPLATE, {
        imports: [TestRovingGroup, TestRovingItem],
      });
      focusItem(3, fixture);
      pressKey(getItem(3), 'Home', fixture);
      expect(document.activeElement).toBe(getItem(1));
    });

    it('should move focus to last item on End', async () => {
      const {fixture} = await render(VERTICAL_TEMPLATE, {
        imports: [TestRovingGroup, TestRovingItem],
      });
      focusItem(1, fixture);
      pressKey(getItem(1), 'End', fixture);
      expect(document.activeElement).toBe(getItem(3));
    });

    it('should not respond to Home/End when homeEnd is disabled', async () => {
      const {fixture} = await render(
        `
        <div data-testid="group" testRovingGroup [testRovingGroupHomeEnd]="false">
          <button data-testid="item-1" testRovingItem>Item 1</button>
          <button data-testid="item-2" testRovingItem>Item 2</button>
          <button data-testid="item-3" testRovingItem>Item 3</button>
        </div>
      `,
        {imports: [TestRovingGroup, TestRovingItem]},
      );
      focusItem(2, fixture);
      pressKey(getItem(2), 'Home', fixture);
      expect(document.activeElement).toBe(getItem(2));
      pressKey(getItem(2), 'End', fixture);
      expect(document.activeElement).toBe(getItem(2));
    });
  });

  describe('disabled items', () => {
    it('should skip hard-disabled items when navigating', async () => {
      const {fixture} = await render(
        `
        <div data-testid="group" testRovingGroup>
          <button data-testid="item-1" testRovingItem>Item 1</button>
          <button data-testid="item-2" testRovingItem [testRovingItemDisabled]="true">Item 2</button>
          <button data-testid="item-3" testRovingItem>Item 3</button>
        </div>
      `,
        {imports: [TestRovingGroup, TestRovingItem]},
      );
      focusItem(1, fixture);
      pressKey(getItem(1), 'ArrowDown', fixture);
      // Should skip item 2 and go to item 3
      expect(document.activeElement).toBe(getItem(3));
    });

    it('should skip hard-disabled items when focusing first', async () => {
      const {fixture} = await render(
        `
        <div data-testid="group" testRovingGroup>
          <button data-testid="item-1" testRovingItem [testRovingItemDisabled]="true">Item 1</button>
          <button data-testid="item-2" testRovingItem>Item 2</button>
          <button data-testid="item-3" testRovingItem>Item 3</button>
        </div>
      `,
        {imports: [TestRovingGroup, TestRovingItem]},
      );
      // Wrap around - should skip disabled item 1 and land on item 2
      focusItem(3, fixture);
      pressKey(getItem(3), 'ArrowDown', fixture);
      expect(document.activeElement).toBe(getItem(2));
    });

    it('should skip hard-disabled items when focusing last', async () => {
      const {fixture} = await render(
        `
        <div data-testid="group" testRovingGroup>
          <button data-testid="item-1" testRovingItem>Item 1</button>
          <button data-testid="item-2" testRovingItem>Item 2</button>
          <button data-testid="item-3" testRovingItem [testRovingItemDisabled]="true">Item 3</button>
        </div>
      `,
        {imports: [TestRovingGroup, TestRovingItem]},
      );
      // Wrap around - should skip disabled item 3 and land on item 2
      focusItem(1, fixture);
      pressKey(getItem(1), 'ArrowUp', fixture);
      expect(document.activeElement).toBe(getItem(2));
    });
  });

  describe('sequential navigation updates tabindex', () => {
    it('should update tabindex as focus moves through items', async () => {
      const {fixture} = await render(VERTICAL_TEMPLATE, {
        imports: [TestRovingGroup, TestRovingItem],
      });
      focusItem(1, fixture);

      // Navigate to item 2
      pressKey(getItem(1), 'ArrowDown', fixture);
      fixture.detectChanges();
      expect(getItem(2)).toHaveAttribute('tabindex', '0');

      // Navigate to item 3
      pressKey(getItem(2), 'ArrowDown', fixture);
      fixture.detectChanges();
      expect(getItem(3)).toHaveAttribute('tabindex', '0');
      expect(getItem(2)).toHaveAttribute('tabindex', '-1');
    });
  });
});
