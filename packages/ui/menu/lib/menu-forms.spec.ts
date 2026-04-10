import {Component, Directive, signal} from '@angular/core';
import {form, FormField} from '@angular/forms/signals';
import {fireEvent, render, screen} from '@testing-library/angular';
import {Menu} from './menu';
import {MenuCheckboxItem} from './menu-checkbox-item';
import {MenuRadioGroup, MenuRadioItem} from './menu-radio';
import {MenuTrigger} from './menu-trigger';

// -----------------------------------------------------------------------------
// Wrapper directives. The test fixture mirrors how a real consumer composes
// the primitives — the checkbox / radio items live inside a Menu opened by a
// MenuTrigger, which is how `inject(Menu)` inside MenuItem actually resolves.
// -----------------------------------------------------------------------------

@Directive({
  selector: '[testMenu]',
  hostDirectives: [Menu],
})
class TestMenu {}

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
  selector: '[testMenuCheckboxItem]',
  hostDirectives: [
    {
      directive: MenuCheckboxItem,
      inputs: ['checked'],
      outputs: ['checkedChange'],
    },
  ],
})
class TestMenuCheckboxItem {}

@Directive({
  selector: '[testMenuRadioGroup]',
  hostDirectives: [
    {
      directive: MenuRadioGroup,
      inputs: ['value'],
      outputs: ['valueChange'],
    },
  ],
})
class TestMenuRadioGroup {}

@Directive({
  selector: '[testMenuRadioItem]',
  hostDirectives: [
    {
      directive: MenuRadioItem,
      inputs: ['value'],
    },
  ],
})
class TestMenuRadioItem {}

const openMenu = (): void => {
  // MenuTrigger opens via `mousedown`, not a synthetic click — testing
  // library's `click` doesn't replay the full pointer sequence, so we fire
  // mouseDown directly to match how the existing menu spec opens menus.
  fireEvent.mouseDown(screen.getByTestId('trigger'));
};

// -----------------------------------------------------------------------------
// MenuCheckboxItem ↔ FormCheckboxControl
// -----------------------------------------------------------------------------

interface CheckboxModel {
  readonly enabled: boolean;
}

@Component({
  selector: 'test-checkbox-form',
  imports: [FormField, TestMenuTrigger, TestMenu, TestMenuCheckboxItem],
  template: `
    <button data-testid="trigger" [testMenuTrigger]="menu">Open</button>
    <ng-template #menu>
      <div testMenu>
        <button data-testid="checkbox" testMenuCheckboxItem [formField]="checkboxForm.enabled">
          Enabled
        </button>
      </div>
    </ng-template>
  `,
})
class TestCheckboxForm {
  readonly model = signal<CheckboxModel>({enabled: false});
  readonly checkboxForm = form(this.model);
}

describe('MenuCheckboxItem ↔ signal forms', () => {
  it('initializes the control from the form model', async () => {
    const {fixture} = await render(TestCheckboxForm);
    openMenu();
    fixture.detectChanges();

    const button = screen.getByTestId('checkbox');
    expect(button).toHaveAttribute('aria-checked', 'false');
    expect(button).toHaveAttribute('data-unchecked', '');
  });

  it('propagates a UI click back to the form model', async () => {
    const {fixture} = await render(TestCheckboxForm);
    const host = fixture.componentInstance;
    openMenu();
    fixture.detectChanges();

    const button = screen.getByTestId('checkbox');
    expect(host.model().enabled).toBe(false);

    fireEvent.click(button);
    fixture.detectChanges();

    expect(button).toHaveAttribute('aria-checked', 'true');
    expect(button).toHaveAttribute('data-checked', '');
    expect(host.model().enabled).toBe(true);
  });

  it('propagates a programmatic form.value.set back to the control', async () => {
    const {fixture} = await render(TestCheckboxForm);
    const host = fixture.componentInstance;
    openMenu();
    fixture.detectChanges();

    host.checkboxForm.enabled().value.set(true);
    fixture.detectChanges();

    const button = screen.getByTestId('checkbox');
    expect(button).toHaveAttribute('aria-checked', 'true');
    expect(button).toHaveAttribute('data-checked', '');
    expect(host.model().enabled).toBe(true);
  });

  it('round-trips: click → model → programmatic clear → control', async () => {
    const {fixture} = await render(TestCheckboxForm);
    const host = fixture.componentInstance;
    openMenu();
    fixture.detectChanges();

    const button = screen.getByTestId('checkbox');

    // UI → model
    fireEvent.click(button);
    fixture.detectChanges();
    expect(host.model().enabled).toBe(true);

    // Model → UI
    host.checkboxForm.enabled().value.set(false);
    fixture.detectChanges();
    expect(button).toHaveAttribute('aria-checked', 'false');
    expect(host.model().enabled).toBe(false);
  });
});

// -----------------------------------------------------------------------------
// MenuRadioGroup ↔ FormValueControl
// -----------------------------------------------------------------------------

type PanelPosition = 'top' | 'bottom' | 'right';

interface RadioModel {
  readonly panelPosition: PanelPosition;
}

@Component({
  selector: 'test-radio-form',
  imports: [FormField, TestMenuTrigger, TestMenu, TestMenuRadioGroup, TestMenuRadioItem],
  template: `
    <button data-testid="trigger" [testMenuTrigger]="menu">Open</button>
    <ng-template #menu>
      <div testMenu>
        <div data-testid="group" testMenuRadioGroup [formField]="radioForm.panelPosition">
          <button data-testid="radio-top" testMenuRadioItem value="top">Top</button>
          <button data-testid="radio-bottom" testMenuRadioItem value="bottom">Bottom</button>
          <button data-testid="radio-right" testMenuRadioItem value="right">Right</button>
        </div>
      </div>
    </ng-template>
  `,
})
class TestRadioForm {
  readonly model = signal<RadioModel>({panelPosition: 'bottom'});
  readonly radioForm = form(this.model);
}

describe('MenuRadioGroup ↔ signal forms', () => {
  const getRadio = (value: PanelPosition): HTMLElement => screen.getByTestId(`radio-${value}`);

  it('initializes the active radio from the form model', async () => {
    const {fixture} = await render(TestRadioForm);
    openMenu();
    fixture.detectChanges();

    expect(getRadio('top')).toHaveAttribute('aria-checked', 'false');
    expect(getRadio('bottom')).toHaveAttribute('aria-checked', 'true');
    expect(getRadio('bottom')).toHaveAttribute('data-checked', '');
    expect(getRadio('right')).toHaveAttribute('aria-checked', 'false');
  });

  it('propagates a radio item click back to the form model', async () => {
    const {fixture} = await render(TestRadioForm);
    const host = fixture.componentInstance;
    openMenu();
    fixture.detectChanges();

    expect(host.model().panelPosition).toBe('bottom');

    fireEvent.click(getRadio('right'));
    fixture.detectChanges();

    expect(host.model().panelPosition).toBe('right');
    expect(getRadio('top')).toHaveAttribute('aria-checked', 'false');
    expect(getRadio('bottom')).toHaveAttribute('aria-checked', 'false');
    expect(getRadio('right')).toHaveAttribute('aria-checked', 'true');
  });

  it('propagates a programmatic form.value.set back to the active radio', async () => {
    const {fixture} = await render(TestRadioForm);
    const host = fixture.componentInstance;
    openMenu();
    fixture.detectChanges();

    host.radioForm.panelPosition().value.set('top');
    fixture.detectChanges();

    expect(getRadio('top')).toHaveAttribute('aria-checked', 'true');
    expect(getRadio('top')).toHaveAttribute('data-checked', '');
    expect(getRadio('bottom')).toHaveAttribute('aria-checked', 'false');
    expect(getRadio('right')).toHaveAttribute('aria-checked', 'false');
    expect(host.model().panelPosition).toBe('top');
  });

  it('enforces exclusive selection across multiple clicks', async () => {
    const {fixture} = await render(TestRadioForm);
    const host = fixture.componentInstance;
    openMenu();
    fixture.detectChanges();

    fireEvent.click(getRadio('top'));
    fixture.detectChanges();
    expect(host.model().panelPosition).toBe('top');
    expect(getRadio('top')).toHaveAttribute('aria-checked', 'true');
    expect(getRadio('bottom')).toHaveAttribute('aria-checked', 'false');
    expect(getRadio('right')).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(getRadio('right'));
    fixture.detectChanges();
    expect(host.model().panelPosition).toBe('right');
    expect(getRadio('top')).toHaveAttribute('aria-checked', 'false');
    expect(getRadio('bottom')).toHaveAttribute('aria-checked', 'false');
    expect(getRadio('right')).toHaveAttribute('aria-checked', 'true');
  });
});
