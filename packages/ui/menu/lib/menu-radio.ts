import {computed, Directive, inject, model} from '@angular/core';
import {type FormValueControl} from '@angular/forms/signals';
import {AttrRole} from '@terseware/ui/atoms';
import {MenuGroup} from './menu-group';
import {MenuItem} from './menu-item';

/**
 * Menu-level container tracking a single selected value across its
 * `MenuRadioItem` children. Implements `FormValueControl<T>` so it can bind
 * via `[formField]`. Provided via DI to its children.
 */
@Directive({
  exportAs: 'menuRadioGroup',
  hostDirectives: [MenuGroup],
})
export class MenuRadioGroup<T = unknown> implements FormValueControl<T | undefined> {
  /** Currently selected value. */
  readonly value = model<T | undefined>(undefined);

  /** Update the selection. Called by `MenuRadioItem` on activate. */
  select(value: T): void {
    this.value.set(value);
  }
}

/**
 * Radio-button-style menu item. `role="menuitemradio"`, writes its `value`
 * into the parent `MenuRadioGroup` on activate without closing the menu.
 *
 * The "am I the active one" computed is named `selected` (not `checked`)
 * because `FormValueControl` forbids a `checked` property. The DOM still
 * exposes `aria-checked` / `data-checked` attributes — those are ARIA-spec
 * names, unrelated to the TS interface constraint.
 */
@Directive({
  exportAs: 'menuRadioItem',
  hostDirectives: [MenuItem],
  host: {
    '[attr.aria-checked]': 'selected()',
    '[attr.data-checked]': 'selected() ? "" : null',
    '[attr.data-unchecked]': '!selected() ? "" : null',
    '(click)': 'activate()',
  },
})
export class MenuRadioItem<T = unknown> implements FormValueControl<T | undefined> {
  /** The value this item represents within the group. */
  readonly value = model<T | undefined>(undefined);

  readonly #group = inject<MenuRadioGroup<T>>(MenuRadioGroup);

  /** True when this item's value matches the group's current value. */
  readonly selected = computed(() => {
    const v = this.value();
    return v !== undefined && this.#group.value() === v;
  });

  constructor() {
    inject(AttrRole).set('menuitemradio');
    inject(MenuItem).closeOnClick.set(false);
  }

  protected activate(): void {
    const v = this.value();
    if (v !== undefined) {
      this.#group.select(v);
    }
  }
}
