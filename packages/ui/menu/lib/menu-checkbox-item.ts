import {Directive, inject, model} from '@angular/core';
import {type FormCheckboxControl} from '@angular/forms/signals';
import {AttrRole} from '@terseware/ui/atoms';
import {MenuItem} from './menu-item';

/**
 * Menu item with `role="menuitemcheckbox"` that toggles a boolean on activate
 * without closing the parent menu. Implements `FormCheckboxControl` so it can
 * be bound via `[formField]`.
 */
@Directive({
  exportAs: 'menuCheckboxItem',
  hostDirectives: [MenuItem],
  host: {
    '[attr.aria-checked]': 'checked()',
    '[attr.data-checked]': 'checked() ? "" : null',
    '[attr.data-unchecked]': '!checked() ? "" : null',
    '(click)': 'toggle()',
  },
})
export class MenuCheckboxItem implements FormCheckboxControl {
  readonly checked = model(false);

  constructor() {
    inject(AttrRole).set('menuitemcheckbox');
    inject(MenuItem).closeOnClick.set(false);
  }

  protected toggle(): void {
    this.checked.update((v) => !v);
  }
}
