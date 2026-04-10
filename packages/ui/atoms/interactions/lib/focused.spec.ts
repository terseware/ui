import {Directive} from '@angular/core';
import {render, screen} from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import {Focused} from './focused';

@Directive({
  selector: '[focused]',
  hostDirectives: [Focused],
})
class TestFocused {}

describe('Focused', () => {
  it('should not have data-focus or data-focus-visible initially', async () => {
    await render(`<button focused>Click me</button>`, {
      imports: [TestFocused],
    });

    const button = screen.getByRole('button');
    expect(button).not.toHaveAttribute('data-focus');
    expect(button).not.toHaveAttribute('data-focus-visible');
  });

  it('should set data-focus on focus', async () => {
    const {fixture} = await render(`<button focused>Click me</button>`, {
      imports: [TestFocused],
    });

    const button = screen.getByRole('button');
    button.focus();
    fixture.detectChanges();

    expect(button).toHaveAttribute('data-focus', '');
  });

  it('should set data-focus-visible on keyboard focus', async () => {
    const {fixture} = await render(`<button focused>Click me</button>`, {
      imports: [TestFocused],
    });

    await userEvent.tab();
    fixture.detectChanges();

    expect(screen.getByRole('button')).toHaveAttribute('data-focus-visible', '');
  });

  it('should remove data-focus on blur', async () => {
    const {fixture} = await render(`<button focused>Click me</button>`, {
      imports: [TestFocused],
    });

    const button = screen.getByRole('button');
    button.focus();
    fixture.detectChanges();
    expect(button).toHaveAttribute('data-focus', '');

    button.blur();
    fixture.detectChanges();
    expect(button).not.toHaveAttribute('data-focus');
  });

  it('should remove data-focus-visible on blur', async () => {
    const {fixture} = await render(`<button focused>Click me</button>`, {
      imports: [TestFocused],
    });

    await userEvent.tab();
    fixture.detectChanges();
    expect(screen.getByRole('button')).toHaveAttribute('data-focus-visible', '');

    await userEvent.tab();
    fixture.detectChanges();
    expect(screen.getByRole('button')).not.toHaveAttribute('data-focus-visible');
  });

  describe('element types', () => {
    it('should work on button elements', async () => {
      const {fixture} = await render(`<button focused>Button</button>`, {
        imports: [TestFocused],
      });

      await userEvent.tab();
      fixture.detectChanges();

      expect(screen.getByRole('button')).toHaveAttribute('data-focus', '');
      expect(screen.getByRole('button')).toHaveAttribute('data-focus-visible', '');
    });

    it('should work on input elements', async () => {
      const {fixture} = await render(`<input focused aria-label="Name" />`, {
        imports: [TestFocused],
      });

      await userEvent.tab();
      fixture.detectChanges();

      expect(screen.getByRole('textbox')).toHaveAttribute('data-focus', '');
    });
  });
});
