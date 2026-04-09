import {
  booleanAttribute,
  Directive,
  effect,
  inject,
  INJECTOR,
  input,
  linkedSignal,
  signal,
  TemplateRef,
  type Type,
  ViewContainerRef,
} from '@angular/core';
import {Anchor} from '@terseware/ui/anchor';
import {AriaControls, AriaExpanded, AriaHasPopup} from '@terseware/ui/atoms';
import {Button} from '@terseware/ui/button';
import {navigateItems} from '@terseware/ui/internal';
import {PublicSource, Source} from '@terseware/ui/sources';
import type {Menu} from './menu';
import type {MenuItem} from './menu-item';

@Directive({
  exportAs: 'menuDisabled',
})
export class MenuDisabled extends PublicSource<boolean> {
  readonly menuDisabled = input(false, {transform: booleanAttribute});
  constructor() {
    super(linkedSignal(() => this.menuDisabled()));
  }
}

@Directive({
  exportAs: 'menuExpanded',
  hostDirectives: [AriaExpanded],
})
export class MenuExpanded extends Source<boolean> {
  readonly menuExpanded = input(false, {transform: booleanAttribute});

  constructor() {
    super(linkedSignal(() => this.menuExpanded()));
    inject(AriaExpanded).bindSource(this.asReadonly());
  }

  toggle() {
    this.update((s) => !s);
  }

  expand() {
    if (this.toValue()) {
      this.set(true);
    }
  }

  close() {
    if (!this.toValue()) {
      this.set(false);
    }
  }
}

export type MenuTriggerForInput = Type<object> | TemplateRef<unknown>;

@Directive({
  exportAs: 'menuTriggerFor',
})
export class MenuTriggerFor extends PublicSource<MenuTriggerForInput | undefined> {
  readonly menuTriggerFor = input<MenuTriggerForInput>();
  constructor() {
    super(linkedSignal(() => this.menuTriggerFor()));
  }
}

@Directive({
  exportAs: 'menuTrigger',
  hostDirectives: [Button, Anchor, AriaHasPopup, AriaControls, MenuDisabled, MenuExpanded],
  host: {
    '(click)': 'expanded.toggle()',
    '(keydown)': 'onKeyDown($event)',
  },
})
export class MenuTrigger {
  readonly #injector = inject(INJECTOR);
  readonly #vcr = inject(ViewContainerRef);

  readonly triggerFor = inject(MenuTriggerFor);
  readonly disabled = inject(MenuDisabled);
  readonly expanded = inject(MenuExpanded);

  readonly #ariaControl = inject(AriaControls);
  readonly #menu = signal(null as Menu | null);
  readonly menu = this.#menu.asReadonly();

  readonly #items = signal([] as MenuItem[]);
  readonly items = this.#items.asReadonly();
  readonly activeIndex = signal(-1);

  constructor() {
    inject(AriaHasPopup).set('menu');

    effect((onCleanup) => {
      const content = this.triggerFor();
      if (this.disabled() || !content || !this.expanded()) {
        return;
      }

      const ref =
        content instanceof TemplateRef
          ? this.#vcr.createEmbeddedView(content, {$implicit: this}, {injector: this.#injector})
          : this.#vcr.createComponent(content, {injector: this.#injector});

      onCleanup(() => {
        ref.destroy();
      });
    });

    effect((onCleanup) => {
      const menu = this.menu();
      if (menu) onCleanup(this.#ariaControl.add(menu.id));
    });
  }

  setMenu(menu: Menu) {
    this.#menu.set(menu);
    return () => this.#menu.set(null);
  }

  addItem(item: MenuItem) {
    this.#items.update((items) => [...items, item]);
    return () => this.#items.update((items) => items.filter((i) => i !== item));
  }

  focusItem(direction: 'next' | 'prev' | 'first' | 'last'): void {
    const items = this.items();
    const idx = navigateItems(items, this.activeIndex(), direction, (i) =>
      i.rovingItem.softDisabled(),
    );
    if (idx !== -1) {
      this.activeIndex.set(idx);
      items[idx]?.rovingItem.focus();
    }
  }

  protected onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.expanded.expand();
        this.focusItem('first');
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.expanded.expand();
        this.focusItem('last');
        break;
      case 'Escape':
        if (this.expanded()) {
          event.preventDefault();
          this.expanded.close();
        }
        break;
    }
  }
}
