import {Directive} from '@angular/core';
import {By} from '@angular/platform-browser';
import {AttrRole, AttrType, Disable, TabIndex} from '@terseware/ui/atoms';
import {Interact} from '@terseware/ui/interact';
import {fireEvent, render, screen} from '@testing-library/angular';
import {userEvent} from '@testing-library/user-event';
import {Button} from './button';

@Directive({
  selector: '[btn]',
  hostDirectives: [
    {
      directive: TabIndex,
      inputs: ['tabIndex'],
    },
    {
      directive: Disable,
      inputs: ['disabled', 'disabledInteractive'],
    },
    Interact,
    {
      directive: AttrRole,
      inputs: ['role'],
    },
    {
      directive: AttrType,
      inputs: ['type'],
    },
    Button,
  ],
})
class Btn {}

describe('Button', () => {
  describe('disabled states', () => {
    it('hard disabled: sets disabled attribute on native elements', async () => {
      await render(`<button btn disabled></button>`, {imports: [Btn]});
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('disabled');
      expect(button).toHaveAttribute('data-disabled', 'hard');
      expect(button).not.toHaveAttribute('aria-disabled');
    });

    it('hard disabled: sets aria-disabled on non-native elements', async () => {
      await render(`<span btn role="button" disabled></span>`, {imports: [Btn]});
      const el = screen.getByRole('button');
      expect(el).not.toHaveAttribute('disabled');
      expect(el).toHaveAttribute('data-disabled', 'hard');
      expect(el).toHaveAttribute('aria-disabled', 'true');
      expect(el).toHaveAttribute('tabindex', '-1');
    });

    it('soft disabled (disabledInteractive): removes native disabled and adds aria-disabled', async () => {
      await render(`<button btn disabled disabledInteractive></button>`, {imports: [Btn]});
      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('disabled');
      expect(button).toHaveAttribute('data-disabled', 'soft');
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveAttribute('tabindex', '0');
    });

    it('soft disabled: non-native element gets aria-disabled and remains disabledInteractive', async () => {
      await render(`<span btn role="button" disabled disabledInteractive></span>`, {
        imports: [Btn],
      });
      const el = screen.getByRole('button');
      expect(el).not.toHaveAttribute('disabled');
      expect(el).toHaveAttribute('data-disabled', 'soft');
      expect(el).toHaveAttribute('aria-disabled', 'true');
      expect(el).toHaveAttribute('tabindex', '0');
    });

    it('not disabled: no disabled attributes', async () => {
      await render(`<button btn></button>`, {imports: [Btn]});
      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('disabled');
      expect(button).not.toHaveAttribute('data-disabled');
      expect(button).not.toHaveAttribute('aria-disabled');
      expect(button).toHaveAttribute('tabindex', '0');
    });
  });

  describe('tabIndex', () => {
    it('defaults to 0', async () => {
      await render(`<button btn></button>`, {imports: [Btn]});
      expect(screen.getByRole('button')).toHaveProperty('tabIndex', 0);
    });

    it('respects custom tabIndex', async () => {
      await render(`<button btn [tabIndex]="3"></button>`, {imports: [Btn]});
      expect(screen.getByRole('button')).toHaveProperty('tabIndex', 3);
    });

    it('sets tabIndex to -1 when hard disabled on non-native elements', async () => {
      await render(`<span btn role="button" disabled></span>`, {imports: [Btn]});
      expect(screen.getByRole('button')).toHaveProperty('tabIndex', -1);
    });

    it('preserves tabIndex when soft disabled', async () => {
      await render(`<span btn role="button" disabled disabledInteractive></span>`, {
        imports: [Btn],
      });
      expect(screen.getByRole('button')).toHaveProperty('tabIndex', 0);
    });
  });

  describe('keyboard events', () => {
    it('prevents non-Tab key events when soft disabled', async () => {
      const {fixture} = await render(
        `<span
          btn
          role="button"
          disabled
          disabledInteractive
        ></span>`,
        {imports: [Btn]},
      );

      const el = screen.getByRole('button');
      el.focus();
      fixture.detectChanges();
      expect(el).toHaveFocus();

      const keydownEvent = new KeyboardEvent('keydown', {key: 'Enter', bubbles: true});
      const preventSpy = vi.spyOn(keydownEvent, 'preventDefault');
      el.dispatchEvent(keydownEvent);
      expect(preventSpy).toHaveBeenCalled();
    });

    it('allows Tab key when soft disabled', async () => {
      await render(
        `<span
          btn
          role="button"
          disabled
          disabledInteractive
        ></span>`,
        {imports: [Btn]},
      );

      const el = screen.getByRole('button');
      el.focus();
      expect(el).toHaveFocus();

      const keydownEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true,
      });
      const preventSpy = vi.spyOn(keydownEvent, 'preventDefault');
      el.dispatchEvent(keydownEvent);
      expect(preventSpy).not.toHaveBeenCalled();
    });
  });

  describe('focus management', () => {
    it('hard disabled native button is not disabledInteractive', async () => {
      await render(`<button btn disabled></button>`, {imports: [Btn]});
      const button = screen.getByRole('button');
      await userEvent.keyboard('[Tab]');
      expect(button).not.toHaveFocus();
    });

    it('soft disabled element is disabledInteractive', async () => {
      await render(`<button btn disabled disabledInteractive></button>`, {imports: [Btn]});
      const button = screen.getByRole('button');
      await userEvent.keyboard('[Tab]');
      expect(button).toHaveFocus();
    });
  });

  it('should set the disabled attribute when disabled', async () => {
    const container = await render(`<button btn [disabled]="true"></button>`, {imports: [Btn]});

    expect(container.getByRole('button')).toHaveAttribute('disabled');
  });

  it('should not set the disabled attribute when not disabled', async () => {
    const container = await render(`<button btn></button>`, {imports: [Btn]});

    expect(container.getByRole('button')).not.toHaveAttribute('disabled');
  });

  it('should not set the disabled attribute when not a button', async () => {
    const container = await render(`<a btn [disabled]="true"></a>`, {imports: [Btn]});
    const button = container.debugElement.queryAll(By.css('a'));
    expect(button.length).toBe(1);
    expect(button[0].nativeElement).not.toHaveAttribute('disabled');
  });

  it('should set the data-disabled attribute when disabled', async () => {
    const container = await render(`<button btn [disabled]="true"></button>`, {imports: [Btn]});

    expect(container.getByRole('button')).toHaveAttribute('data-disabled', 'hard');
  });

  it('should not set the data-disabled attribute when not disabled', async () => {
    const container = await render(`<button btn></button>`, {imports: [Btn]});

    expect(container.getByRole('button')).not.toHaveAttribute('data-disabled');
  });

  it('should update the data-disabled attribute when disabled changes', async () => {
    const {getByRole, rerender, fixture} = await render(
      `<button btn [disabled]="isDisabled"></button>`,
      {imports: [Btn], componentProperties: {isDisabled: false}},
    );

    const button = getByRole('button');
    expect(button).not.toHaveAttribute('data-disabled');
    expect(button).not.toHaveAttribute('disabled');

    await rerender({componentProperties: {isDisabled: true}});
    fixture.detectChanges();
    expect(button).toHaveAttribute('data-disabled');
    expect(button).toHaveAttribute('disabled');
  });

  describe('disabled state', () => {
    describe('native button', () => {
      it('should set the disabled attribute when disabled', async () => {
        await render(`<button btn [disabled]="true">Click me</button>`, {imports: [Btn]});

        expect(screen.getByRole('button')).toHaveAttribute('disabled');
      });

      it('should not set the disabled attribute when not disabled', async () => {
        await render(`<button btn>Click me</button>`, {imports: [Btn]});

        expect(screen.getByRole('button')).not.toHaveAttribute('disabled');
      });

      it('should update disabled attribute when disabled changes', async () => {
        const {rerender, fixture} = await render(
          `<button btn [disabled]="isDisabled">Click me</button>`,
          {imports: [Btn], componentProperties: {isDisabled: false}},
        );

        const button = screen.getByRole('button');
        expect(button).not.toHaveAttribute('disabled');

        await rerender({componentProperties: {isDisabled: true}});
        fixture.detectChanges();
        expect(button).toHaveAttribute('disabled');

        await rerender({componentProperties: {isDisabled: false}});
        fixture.detectChanges();
        expect(button).not.toHaveAttribute('disabled');
      });
    });

    describe('non-native element', () => {
      it('should not set the disabled attribute on non-button elements', async () => {
        const container = await render(`<a btn [disabled]="true">Link</a>`, {imports: [Btn]});

        const anchor = container.debugElement.queryAll(By.css('a'));
        expect(anchor.length).toBe(1);
        expect(anchor[0].nativeElement).not.toHaveAttribute('disabled');
      });

      it('should not set the disabled attribute on div elements', async () => {
        await render(`<div btn [disabled]="true">Custom</div>`, {imports: [Btn]});

        const div = screen.getByRole('button');
        expect(div).not.toHaveAttribute('disabled');
      });
    });
  });

  describe('data-disabled attribute', () => {
    it('should set data-disabled when disabled', async () => {
      await render(`<button btn [disabled]="true">Click me</button>`, {imports: [Btn]});

      expect(screen.getByRole('button')).toHaveAttribute('data-disabled', 'hard');
    });

    it('should not set data-disabled when not disabled', async () => {
      await render(`<button btn>Click me</button>`, {imports: [Btn]});

      expect(screen.getByRole('button')).not.toHaveAttribute('data-disabled');
    });

    it('should update data-disabled when disabled changes', async () => {
      const {rerender, fixture} = await render(
        `<button btn [disabled]="isDisabled">Click me</button>`,
        {imports: [Btn], componentProperties: {isDisabled: false}},
      );

      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('data-disabled');

      await rerender({componentProperties: {isDisabled: true}});
      fixture.detectChanges();
      expect(button).toHaveAttribute('data-disabled', 'hard');
    });

    it('should set data-disabled on non-native elements when disabled', async () => {
      await render(`<div btn [disabled]="true">Custom</div>`, {imports: [Btn]});

      expect(screen.getByRole('button')).toHaveAttribute('data-disabled', 'hard');
    });
  });

  describe('disabled interactive', () => {
    it('should set data-disabled to soft when disabled and disabledInteractive is true', async () => {
      await render(`<button btn [disabled]="true" [disabledInteractive]="true">Click me</button>`, {
        imports: [Btn],
      });

      expect(screen.getByRole('button')).toHaveAttribute('data-disabled', 'soft');
    });

    it('should not set disabled when disabledInteractive is true', async () => {
      await render(`<button btn [disabled]="true" [disabledInteractive]="true">Click me</button>`, {
        imports: [Btn],
      });

      expect(screen.getByRole('button')).toHaveAttribute('data-disabled', 'soft');
    });
  });

  describe('role attribute', () => {
    it('should not add role="button" to native button elements', async () => {
      await render(`<button btn>Click me</button>`, {imports: [Btn]});

      // Native buttons have implicit button role, no explicit attribute needed
      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
      expect(button.getAttribute('role')).toBeNull();
    });

    it('should add role="button" to non-native elements without explicit role', async () => {
      await render(`<div btn>Custom Button</div>`, {imports: [Btn]});

      const div = screen.getByRole('button');
      expect(div).toHaveAttribute('role', 'button');
    });

    it('should not override explicit role input', async () => {
      await render(`<div btn [role]="'menuitem'">Menu Item</div>`, {imports: [Btn]});

      const div = screen.getByRole('menuitem');
      expect(div).toHaveAttribute('role', 'menuitem');
    });

    it('should preserve link role for anchors with href', async () => {
      const container = await render(`<a btn href="/test">Link</a>`, {imports: [Btn]});

      const link = container.debugElement.query(By.css('a'));
      expect(link.nativeElement).not.toHaveAttribute('role', 'button');
    });

    it('should not add role to input[type="button"]', async () => {
      await render(`<input btn type="button" value="Input Button" />`, {imports: [Btn]});

      const input = screen.getByRole('button');
      expect(input.getAttribute('role')).toBeNull();
    });

    it('should not add role to input[type="submit"]', async () => {
      await render(`<input btn type="submit" value="Submit" />`, {imports: [Btn]});

      const input = screen.getByRole('button');
      expect(input.getAttribute('role')).toBeNull();
    });

    it('should not add role to input[type="reset"]', async () => {
      await render(`<input btn type="reset" value="Reset" />`, {imports: [Btn]});

      const input = screen.getByRole('button');
      expect(input.getAttribute('role')).toBeNull();
    });
  });

  describe('with different element types', () => {
    it('should work with button elements', async () => {
      await render(`<button btn>Button</button>`, {imports: [Btn]});

      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
    });

    it('should work with anchor elements', async () => {
      const container = await render(`<a btn href="#">Link</a>`, {imports: [Btn]});

      const link = container.debugElement.query(By.css('a'));
      expect(link.nativeElement.tagName).toBe('A');
    });

    it('should work with div elements and add role', async () => {
      await render(`<div btn>Custom</div>`, {imports: [Btn]});

      const div = screen.getByRole('button');
      expect(div.tagName).toBe('DIV');
      expect(div).toHaveAttribute('role', 'button');
    });

    it('should work with span elements and add role', async () => {
      await render(`<span btn>Custom</span>`, {imports: [Btn]});

      const span = screen.getByRole('button');
      expect(span.tagName).toBe('SPAN');
      expect(span).toHaveAttribute('role', 'button');
    });

    it('should work with input[type="button"] elements', async () => {
      await render(`<input btn type="button" value="Input Button" />`, {imports: [Btn]});

      const input = screen.getByRole('button');
      expect(input.tagName).toBe('INPUT');
    });

    it('should work with input[type="submit"] elements', async () => {
      await render(`<input btn type="submit" value="Submit" />`, {imports: [Btn]});

      const input = screen.getByRole('button');
      expect(input.tagName).toBe('INPUT');
    });
  });

  describe('role attribute handling', () => {
    it('should preserve custom role via input through disabled state changes', async () => {
      const {rerender, fixture} = await render(
        `<div btn [role]="'tab'" [disabled]="isDisabled">Tab</div>`,
        {imports: [Btn], componentProperties: {isDisabled: false}},
      );

      const div = screen.getByRole('tab');
      expect(div).toHaveAttribute('role', 'tab');

      await rerender({componentProperties: {isDisabled: true}});
      fixture.detectChanges();
      expect(div).toHaveAttribute('role', 'tab');
      expect(div).toHaveAttribute('data-disabled', 'hard');

      await rerender({componentProperties: {isDisabled: false}});
      fixture.detectChanges();
      expect(div).toHaveAttribute('role', 'tab');
      expect(div).not.toHaveAttribute('data-disabled');
    });

    it('should fall back to auto-assignment when role is null on non-native elements', async () => {
      await render(`<div btn [attr.role]="null">Custom</div>`, {imports: [Btn]});

      // When role is null (default), auto-assignment kicks in for non-native elements
      expect(screen.getByRole('button')).toHaveAttribute('role', 'button');
    });

    it('should properly handle initial role assignment from attribute', async () => {
      const {rerender, fixture} = await render(`<div btn [role]="role">Item</div>`, {
        imports: [Btn],
        componentProperties: {role: 'tab'},
      });

      const el = screen.getByRole('tab');
      expect(el).toHaveAttribute('role', 'tab');

      await rerender({componentProperties: {role: 'option'}});
      fixture.detectChanges();
      expect(el).toHaveAttribute('role', 'option');
    });
  });

  describe('tabindex', () => {
    it('should have tabindex="0" by default', async () => {
      await render(`<button btn>Click me</button>`, {imports: [Btn]});

      expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0');
    });

    it('should have tabindex="0" on non-native elements', async () => {
      await render(`<div btn>Custom</div>`, {imports: [Btn]});

      expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0');
    });
  });

  describe('aria-disabled', () => {
    it('should set aria-disabled on non-native elements when disabled', async () => {
      await render(`<div btn [disabled]="true">Custom</div>`, {imports: [Btn]});

      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });

    it('should not set aria-disabled on native button when disabled', async () => {
      await render(`<button btn [disabled]="true">Click me</button>`, {imports: [Btn]});

      // Native buttons use the disabled attribute, not aria-disabled
      expect(screen.getByRole('button')).not.toHaveAttribute('aria-disabled');
    });

    it('should update aria-disabled when disabled changes on non-native element', async () => {
      const {rerender, fixture} = await render(`<div btn [disabled]="isDisabled">Custom</div>`, {
        imports: [Btn],
        componentProperties: {isDisabled: false},
      });

      const div = screen.getByRole('button');
      expect(div).not.toHaveAttribute('aria-disabled');

      await rerender({componentProperties: {isDisabled: true}});
      fixture.detectChanges();
      expect(div).toHaveAttribute('aria-disabled', 'true');

      await rerender({componentProperties: {isDisabled: false}});
      fixture.detectChanges();
      expect(div).not.toHaveAttribute('aria-disabled');
    });

    it('should set aria-disabled on native button when disabledInteractive', async () => {
      await render(`<button btn [disabled]="true" [disabledInteractive]="true">Click me</button>`, {
        imports: [Btn],
      });

      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('input types with native button behavior', () => {
    it('should set disabled attribute on input[type="button"] when disabled', async () => {
      await render(`<input btn type="button" [disabled]="true" value="Input Button" />`, {
        imports: [Btn],
      });

      expect(screen.getByRole('button')).toHaveAttribute('disabled');
    });

    it('should set disabled attribute on input[type="submit"] when disabled', async () => {
      await render(`<input btn type="submit" [disabled]="true" value="Submit" />`, {
        imports: [Btn],
      });

      expect(screen.getByRole('button')).toHaveAttribute('disabled');
    });

    it('should set disabled attribute on input[type="reset"] when disabled', async () => {
      await render(`<input btn type="reset" [disabled]="true" value="Reset" />`, {imports: [Btn]});

      expect(screen.getByRole('button')).toHaveAttribute('disabled');
    });
  });

  describe('combined disabled and disabledInteractive transitions', () => {
    it('should handle enabling disabledInteractive while already disabled', async () => {
      const {rerender, fixture} = await render(
        `<button btn [disabled]="true" [disabledInteractive]="isDisabledInteractive">Click me</button>`,
        {imports: [Btn], componentProperties: {isDisabledInteractive: false}},
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('disabled');
      expect(button).toHaveAttribute('data-disabled', 'hard');

      await rerender({componentProperties: {isDisabledInteractive: true}});
      fixture.detectChanges();

      expect(button).not.toHaveAttribute('disabled');
      expect(button).toHaveAttribute('data-disabled', 'soft');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('should handle disabling while disabledInteractive is true', async () => {
      const {rerender, fixture} = await render(
        `<button btn [disabled]="isDisabled" [disabledInteractive]="true">Click me</button>`,
        {imports: [Btn], componentProperties: {isDisabled: false}},
      );

      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('disabled');
      expect(button).not.toHaveAttribute('data-disabled');

      await rerender({componentProperties: {isDisabled: true}});
      fixture.detectChanges();

      expect(button).not.toHaveAttribute('disabled');
      expect(button).toHaveAttribute('data-disabled', 'soft');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('anchor elements with href (link buttons)', () => {
    it('should preserve link role on anchor with href', async () => {
      const container = await render(`<a btn href="/dashboard">Dashboard</a>`, {imports: [Btn]});

      const link = container.debugElement.query(By.css('a'));
      expect(link.nativeElement).toHaveAttribute('href', '/dashboard');
      // Should have implicit link role, not button
      expect(link.nativeElement.getAttribute('role')).toBeNull();
    });

    it('should set data-disabled on anchor with href when disabled', async () => {
      const container = await render(`<a btn href="/dashboard" [disabled]="true">Dashboard</a>`, {
        imports: [Btn],
      });

      const link = container.debugElement.query(By.css('a')).nativeElement;
      expect(link).toHaveAttribute('data-disabled', 'hard');
      // Anchors don't support native disabled, so no disabled attribute
      expect(link).not.toHaveAttribute('disabled');
      // Should have aria-disabled for AT
      expect(link).toHaveAttribute('aria-disabled', 'true');
    });

    it('should support disabledInteractive on anchor with href', async () => {
      const container = await render(
        `<a btn href="/dashboard" [disabled]="true" [disabledInteractive]="true">Dashboard</a>`,
        {imports: [Btn]},
      );

      const link = container.debugElement.query(By.css('a')).nativeElement;
      expect(link).toHaveAttribute('data-disabled', 'soft');
      expect(link).toHaveAttribute('tabindex', '0');
    });
  });

  describe('keyboard interactions', () => {
    describe('non-native button', () => {
      it('can be activated with Enter key', async () => {
        const clickSpy = vi.fn();
        const {fixture} = await render(`<span btn (click)="onClick($event)">Action</span>`, {
          imports: [Btn],
          componentProperties: {onClick: clickSpy},
        });

        const button = screen.getByRole('button');
        button.focus();
        fixture.detectChanges();
        expect(button).toHaveFocus();

        const keydownEvent = new KeyboardEvent('keydown', {key: 'Enter', bubbles: true});
        button.dispatchEvent(keydownEvent);
        expect(clickSpy).toHaveBeenCalledTimes(1);
      });

      it('can be activated with Space key (fires on keyup)', async () => {
        const clickSpy = vi.fn();
        const {fixture} = await render(`<span btn (click)="onClick($event)">Action</span>`, {
          imports: [Btn],
          componentProperties: {onClick: clickSpy},
        });

        const button = screen.getByRole('button');
        button.focus();
        fixture.detectChanges();
        expect(button).toHaveFocus();

        // keydown Space should NOT fire click yet
        const keydownEvent = new KeyboardEvent('keydown', {
          key: ' ',
          bubbles: true,
          cancelable: true,
        });
        button.dispatchEvent(keydownEvent);
        expect(clickSpy).toHaveBeenCalledTimes(0);
        // Should prevent default (scroll)
        expect(keydownEvent.defaultPrevented).toBe(true);

        // keyup Space should fire click
        const keyupEvent = new KeyboardEvent('keyup', {key: ' ', bubbles: true});
        button.dispatchEvent(keyupEvent);
        expect(clickSpy).toHaveBeenCalledTimes(1);
      });

      it('Space prevents default on keydown to avoid scrolling', async () => {
        await render(`<div btn>Action</div>`, {imports: [Btn]});

        const button = screen.getByRole('button');
        button.focus();

        const keydownEvent = new KeyboardEvent('keydown', {
          key: ' ',
          bubbles: true,
          cancelable: true,
        });
        button.dispatchEvent(keydownEvent);
        expect(keydownEvent.defaultPrevented).toBe(true);
      });

      it('Enter prevents default on keydown', async () => {
        await render(`<div btn>Action</div>`, {imports: [Btn]});

        const button = screen.getByRole('button');
        button.focus();

        const keydownEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          cancelable: true,
        });
        button.dispatchEvent(keydownEvent);
        expect(keydownEvent.defaultPrevented).toBe(true);
      });
    });

    describe('native button', () => {
      it('does not double-fire click on Enter (native handles it)', async () => {
        const clickSpy = vi.fn();
        await render(`<button btn (click)="onClick($event)">Click me</button>`, {
          imports: [Btn],
          componentProperties: {onClick: clickSpy},
        });

        const button = screen.getByRole('button');
        button.focus();

        // Simulate native Enter behavior: keydown fires native click
        const keydownEvent = new KeyboardEvent('keydown', {key: 'Enter', bubbles: true});
        button.dispatchEvent(keydownEvent);
        // Our handler should NOT fire click on native buttons
        expect(clickSpy).toHaveBeenCalledTimes(0);
      });

      it('does not double-fire click on Space (native handles it)', async () => {
        const clickSpy = vi.fn();
        await render(`<button btn (click)="onClick($event)">Click me</button>`, {
          imports: [Btn],
          componentProperties: {onClick: clickSpy},
        });

        const button = screen.getByRole('button');
        button.focus();

        const keyupEvent = new KeyboardEvent('keyup', {key: ' ', bubbles: true});
        button.dispatchEvent(keyupEvent);
        // Our handler should NOT fire click on native buttons
        expect(clickSpy).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('disabled prevents interactions', () => {
    it('prevents click events when disabled', async () => {
      const clickSpy = vi.fn();
      await render(`<div btn [disabled]="true" (click)="onClick($event)">Custom</div>`, {
        imports: [Btn],
        componentProperties: {onClick: clickSpy},
      });

      const button = screen.getByRole('button');
      button.click();
      expect(clickSpy).toHaveBeenCalledTimes(0);
    });

    it('prevents keyboard activation when disabled on non-native element', async () => {
      const clickSpy = vi.fn();
      await render(`<span btn [disabled]="true" (click)="onClick($event)">Action</span>`, {
        imports: [Btn],
        componentProperties: {onClick: clickSpy},
      });

      const button = screen.getByRole('button');

      button.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
      expect(clickSpy).toHaveBeenCalledTimes(0);

      button.dispatchEvent(new KeyboardEvent('keyup', {key: ' ', bubbles: true}));
      expect(clickSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe('disabledInteractive prevents interactions except focus/blur', () => {
    it('allows focus when disabledInteractive', async () => {
      await render(
        `<span btn role="button" [disabled]="true" [disabledInteractive]="true">Action</span>`,
        {imports: [Btn]},
      );

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('prevents click when disabledInteractive', async () => {
      const clickSpy = vi.fn();
      await render(
        `<span btn [disabled]="true" [disabledInteractive]="true" (click)="onClick($event)">Action</span>`,
        {imports: [Btn], componentProperties: {onClick: clickSpy}},
      );

      const button = screen.getByRole('button');
      button.click();
      expect(clickSpy).toHaveBeenCalledTimes(0);
    });

    it('prevents Enter activation when disabledInteractive', async () => {
      const clickSpy = vi.fn();
      await render(
        `<span btn [disabled]="true" [disabledInteractive]="true" (click)="onClick($event)">Action</span>`,
        {imports: [Btn], componentProperties: {onClick: clickSpy}},
      );

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();

      button.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
      expect(clickSpy).toHaveBeenCalledTimes(0);
    });

    it('prevents Space activation when disabledInteractive', async () => {
      const clickSpy = vi.fn();
      await render(
        `<span btn [disabled]="true" [disabledInteractive]="true" (click)="onClick($event)">Action</span>`,
        {imports: [Btn], componentProperties: {onClick: clickSpy}},
      );

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();

      button.dispatchEvent(new KeyboardEvent('keydown', {key: ' ', bubbles: true}));
      button.dispatchEvent(new KeyboardEvent('keyup', {key: ' ', bubbles: true}));
      expect(clickSpy).toHaveBeenCalledTimes(0);
    });

    it('allows blur when disabledInteractive', async () => {
      const blurSpy = vi.fn();
      await render(
        `<span btn [disabled]="true" [disabledInteractive]="true" (blur)="onBlur($event)">Action</span>`,
        {imports: [Btn], componentProperties: {onBlur: blurSpy}},
      );

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();

      button.blur();
      expect(blurSpy).toHaveBeenCalledTimes(1);
      expect(button).not.toHaveFocus();
    });
  });

  describe('loading state use case', () => {
    it('should maintain tabindex during loading state transitions', async () => {
      const {rerender, fixture} = await render(
        `<button btn [disabled]="isLoading" [disabledInteractive]="isLoading">
          {{ isLoading ? 'Loading...' : 'Submit' }}
        </button>`,
        {imports: [Btn], componentProperties: {isLoading: false}},
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('tabindex', '0');
      expect(button).not.toHaveAttribute('disabled');

      // Start loading
      await rerender({componentProperties: {isLoading: true}});
      fixture.detectChanges();
      expect(button).toHaveAttribute('tabindex', '0');
      expect(button).not.toHaveAttribute('disabled');
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveAttribute('data-disabled', 'soft');

      // Finish loading
      await rerender({componentProperties: {isLoading: false}});
      fixture.detectChanges();
      expect(button).toHaveAttribute('tabindex', '0');
      expect(button).not.toHaveAttribute('disabled');
      expect(button).not.toHaveAttribute('aria-disabled');
      expect(button).not.toHaveAttribute('data-disabled');
    });
  });

  describe('Base-UI ported', () => {
    describe('prop: disabled', () => {
      it('native button: uses the disabled attribute and is not disabledInteractive', async () => {
        const handleClick = vi.fn();

        await render(`<button btn disabled (click)="handleClick()"></button>`, {
          imports: [Btn],
          componentProperties: {handleClick},
        });

        const button = screen.getByRole('button');

        expect(button).toHaveAttribute('disabled');
        expect(button).toHaveAttribute('data-disabled');
        expect(button).not.toHaveAttribute('aria-disabled');

        await userEvent.keyboard('[Tab]');
        expect(button).not.toHaveFocus();

        await userEvent.click(button);
        expect(handleClick).toHaveBeenCalledTimes(0);
      });

      it('custom element: applies aria-disabled and is not disabledInteractive', async () => {
        const handleClick = vi.fn();

        await render(`<span btn disabled (click)="handleClick()"></span>`, {
          imports: [Btn],
          componentProperties: {handleClick},
        });

        const button = screen.getByRole('button');

        expect(button).not.toHaveAttribute('disabled');
        expect(button).toHaveAttribute('data-disabled');
        expect(button).toHaveAttribute('aria-disabled', 'true');
        expect(button).toHaveAttribute('tabindex', '-1');

        await userEvent.keyboard('[Tab]');
        expect(button).not.toHaveFocus();

        await userEvent.click(button);
        expect(handleClick).toHaveBeenCalledTimes(0);
      });
    });

    describe('prop: disabledInteractive', () => {
      it('native button: prevents click but remains disabledInteractive', async () => {
        const handleClick = vi.fn();

        await render(`<button btn disabled disabledInteractive (click)="handleClick()"></button>`, {
          imports: [Btn],
          componentProperties: {handleClick},
        });

        const button = screen.getByRole('button');

        expect(button).not.toHaveAttribute('disabled');
        expect(button).toHaveAttribute('data-disabled');
        expect(button).toHaveAttribute('aria-disabled', 'true');
        expect(button).toHaveAttribute('tabindex', '0');

        await userEvent.keyboard('[Tab]');
        expect(button).toHaveFocus();

        await userEvent.click(button);
        expect(handleClick).toHaveBeenCalledTimes(0);
      });

      it('custom element: prevents click but remains disabledInteractive', async () => {
        const handleClick = vi.fn();

        await render(`<span btn disabled disabledInteractive (click)="handleClick()"></span>`, {
          imports: [Btn],
          componentProperties: {handleClick},
        });

        const button = screen.getByRole('button');

        expect(button).not.toHaveAttribute('disabled');
        expect(button).toHaveAttribute('data-disabled');
        expect(button).toHaveAttribute('aria-disabled', 'true');
        expect(button).toHaveAttribute('tabindex', '0');

        await userEvent.keyboard('[Tab]');
        expect(button).toHaveFocus();

        await userEvent.click(button);
        expect(handleClick).toHaveBeenCalledTimes(0);
      });

      it('allows disabled buttons to be focused', async () => {
        await render(`<button btn disabled disabledInteractive></button>`, {imports: [Btn]});
        const button = screen.getByRole('button');
        await userEvent.keyboard('[Tab]');
        expect(button).toHaveFocus();
      });

      it('prevents click but allows focus and blur', async () => {
        const handleClick = vi.fn();
        const handleFocus = vi.fn();
        const handleBlur = vi.fn();

        await render(
          `<span
              btn
              disabled
              disabledInteractive
              (click)="handleClick()"
              (focus)="handleFocus()"
              (blur)="handleBlur()"
            ></span>`,
          {imports: [Btn], componentProperties: {handleClick, handleFocus, handleBlur}},
        );

        const button = screen.getByRole('button');
        expect(document.activeElement).not.toBe(button);

        expect(handleFocus).toHaveBeenCalledTimes(0);
        await userEvent.keyboard('[Tab]');
        expect(button).toHaveFocus();
        expect(handleFocus).toHaveBeenCalledTimes(1);

        await userEvent.click(button);
        expect(handleClick).toHaveBeenCalledTimes(0);

        expect(handleBlur).toHaveBeenCalledTimes(0);
        await userEvent.keyboard('[Tab]');
        expect(handleBlur).toHaveBeenCalledTimes(1);
        expect(document.activeElement).not.toBe(button);
      });
    });

    describe('non-native button', () => {
      describe('keyboard interactions', () => {
        ['Enter', 'Space'].forEach((key) => {
          it(`can be activated with ${key} key`, async () => {
            const clickSpy = vi.fn();

            await render(`<div btn (click)="onClick()"></div>`, {
              imports: [Btn],
              componentProperties: {onClick: clickSpy},
            });

            const button = screen.getByRole('button');

            await userEvent.keyboard('[Tab]');
            expect(button).toHaveFocus();

            await userEvent.keyboard(`[${key}]`);
            expect(clickSpy).toHaveBeenCalledTimes(1);
          });
        });
      });
    });

    describe('param: tabIndex', () => {
      it('returns tabIndex when host component is BUTTON', async () => {
        await render(`<button btn></button>`, {imports: [Btn]});
        const button = screen.getByRole('button');
        expect(button).toHaveProperty('tabIndex', 0);
      });

      it('returns tabIndex when host component is not BUTTON', async () => {
        await render(`<span btn></span>`, {imports: [Btn]});
        const button = screen.getByRole('button');
        expect(button).toHaveProperty('tabIndex', 0);
      });

      it('returns custom tabIndex if explicitly provided', async () => {
        await render(`<button btn [tabIndex]="3"></button>`, {imports: [Btn]});
        const button = screen.getByRole('button');
        expect(button).toHaveProperty('tabIndex', 3);
      });
    });

    describe('arbitrary props', () => {
      it('passes data attributes to the host element', async () => {
        await render(`<button btn data-testid="button-test-id"></button>`, {imports: [Btn]});
        expect(screen.getByRole('button')).toHaveAttribute('data-testid', 'button-test-id');
      });
    });

    describe('event handlers', () => {
      it('key: Space fires keyup then click on non-composite buttons', async () => {
        const handleKeyDown = vi.fn();
        const handleKeyUp = vi.fn();
        const handleClick = vi.fn();

        await render(
          `<span
              btn
              (keydown)="handleKeyDown()"
              (keyup)="handleKeyUp()"
              (click)="handleClick()"
            ></span>`,
          {
            imports: [Btn],
            componentProperties: {
              handleKeyDown,
              handleKeyUp,
              handleClick,
            },
          },
        );

        const button = screen.getByRole('button');
        button.focus();

        fireEvent.keyDown(button, {key: ' '});
        expect(handleKeyDown).toHaveBeenCalledTimes(1);
        expect(handleClick).toHaveBeenCalledTimes(0);

        fireEvent.keyUp(button, {key: ' '});
        expect(handleKeyUp).toHaveBeenCalledTimes(1);
        expect(handleClick).toHaveBeenCalledTimes(1);
      });

      it('key: Space fires a click event even if preventDefault was called on keyUp', async () => {
        const handleClick = vi.fn();

        await render(
          `<span
              btn
              (keyup)="handleKeyUp($event)"
              (click)="handleClick()"
            ></span>`,
          {
            imports: [Btn],
            componentProperties: {
              handleClick,
              handleKeyUp: (event: KeyboardEvent) => {
                event.preventDefault();
              },
            },
          },
        );

        const button = screen.getByRole('button');

        await userEvent.keyboard('[Tab]');
        expect(button).toHaveFocus();

        await userEvent.keyboard('[Space]');
        expect(handleClick).toHaveBeenCalledTimes(1);
      });

      it('key: Enter fires keydown then click on non-native buttons', async () => {
        const handleKeyDown = vi.fn();
        const handleClick = vi.fn();

        await render(
          `<span
              btn
              (keydown)="handleKeyDown()"
              (click)="handleClick()"
            ></span>`,
          {imports: [Btn], componentProperties: {handleKeyDown, handleClick}},
        );

        const button = screen.getByRole('button');
        button.focus();
        expect(button).toHaveFocus();

        expect(handleKeyDown).toHaveBeenCalledTimes(0);
        fireEvent.keyDown(button, {key: 'Enter'});
        expect(handleKeyDown).toHaveBeenCalledTimes(1);
        expect(handleClick).toHaveBeenCalledTimes(1);
      });
    });

    describe('attributes', () => {
      it('non-native button gets role="button"', async () => {
        await render(`<span btn></span>`, {imports: [Btn]});
        expect(screen.getByRole('button')).toHaveAttribute('role', 'button');
      });

      it('native button does not get explicit role', async () => {
        await render(`<button btn></button>`, {imports: [Btn]});
        const button = screen.getByRole('button');
        expect(button).not.toHaveAttribute('role');
      });

      it('non-native button gets type=null (no type attribute)', async () => {
        await render(`<span btn></span>`, {imports: [Btn]});
        const button = screen.getByRole('button');
        expect(button).not.toHaveAttribute('type');
      });

      it('native button gets type="button"', async () => {
        await render(`<button btn></button>`, {imports: [Btn]});
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('type', 'button');
      });

      describe('Host attributes', () => {
        it('should keep the role attribute when it is explicitly set', async () => {
          await render(`<span btn role="menuitem"></span>`, {imports: [Btn]});
          const button = screen.getByRole('menuitem');
          expect(button).toHaveAttribute('role', 'menuitem');
        });

        it('should keep the type attribute when it is explicitly set', async () => {
          await render(`<button btn type="submit"></button>`, {imports: [Btn]});
          const button = screen.getByRole('button');
          expect(button).toHaveAttribute('type', 'submit');
        });
      });
    });

    describe('Composition', () => {
      it('should compose two base buttons and register non-duplicated events', async () => {
        @Directive({
          selector: '[btn2]',
          exportAs: 'btn2',
        })
        class Button2 extends Btn {}

        const handleClick = vi.fn();
        const handleMousedown = vi.fn();
        const handleKeyDown = vi.fn();
        const handleKeyUp = vi.fn();
        const handlePointerDown = vi.fn();

        await render(
          `<button
          btn
          btn2
          (click)="handleClick()"
          (mousedown)="handleMousedown()"
          (keydown)="handleKeyDown()"
          (keyup)="handleKeyUp()"
          (pointerdown)="handlePointerDown()"
          ></button>`,
          {
            imports: [Btn, Button2],
            componentProperties: {
              handleClick,
              handleMousedown,
              handleKeyDown,
              handleKeyUp,
              handlePointerDown,
            },
          },
        );

        const button = screen.getByRole('button');
        fireEvent.mouseDown(button, {button: 0});
        expect(handleMousedown).toHaveBeenCalledTimes(1);

        fireEvent.pointerDown(button, {button: 0});
        expect(handlePointerDown).toHaveBeenCalledTimes(1);

        button.click();
        expect(handleClick).toHaveBeenCalledTimes(1);

        button.focus();
        expect(button).toHaveFocus();

        fireEvent.keyDown(button, {key: 'Enter'});
        expect(handleKeyDown).toHaveBeenCalledTimes(1);
        expect(handleClick).toHaveBeenCalledTimes(1);

        fireEvent.keyUp(button, {key: 'Enter'});
        expect(handleKeyUp).toHaveBeenCalledTimes(1);
        expect(handleClick).toHaveBeenCalledTimes(1);
      });
    });
  });
});
