import {
  booleanAttribute,
  computed,
  Directive,
  DOCUMENT,
  effect,
  inject,
  INJECTOR,
  input,
  linkedSignal,
  signal,
  TemplateRef,
  ViewContainerRef,
  type Type,
} from '@angular/core';
import {listener} from '@signality/core';
import {Anchor} from '@terseware/ui/anchor';
import {AriaControls, AriaHasPopup, KeyboardEvents, OpenClose} from '@terseware/ui/atoms';
import {Button} from '@terseware/ui/button';
import {injectElement, Timeout, type Fn} from '@terseware/ui/internal';
import {PublicWritableSource} from '@terseware/ui/state';
import {Menu} from './menu';

export type MenuTriggerForInput = Menu | Type<object> | TemplateRef<unknown>;

@Directive({
  exportAs: 'menuTriggerFor',
})
export class MenuTriggerFor extends PublicWritableSource<MenuTriggerForInput | undefined> {
  readonly menuTriggerFor = input<MenuTriggerForInput>();
  constructor() {
    super(linkedSignal(() => this.menuTriggerFor()));
  }
}

@Directive({
  exportAs: 'menuDisabled',
})
export class MenuDisabled extends PublicWritableSource<boolean> {
  readonly menuDisabled = input(true, {transform: booleanAttribute});
  constructor() {
    super(linkedSignal(() => this.menuDisabled()));
  }
}

@Directive({
  exportAs: 'menuTrigger',
  hostDirectives: [
    MenuDisabled,
    MenuTriggerFor,
    OpenClose,
    Button,
    Anchor,
    AriaHasPopup,
    AriaControls,
    KeyboardEvents,
  ],
  host: {
    '(mousedown)': 'onMouseDown()',
    '(focusout)': 'onFocusOut($event)',
  },
})
export class MenuTrigger {
  readonly element = injectElement();
  readonly #injector = inject(INJECTOR);
  readonly #vcr = inject(ViewContainerRef);
  readonly triggerFor = inject(MenuTriggerFor);
  readonly #ariaControl = inject(AriaControls);
  readonly #disabled = inject(MenuDisabled);
  readonly disabled = this.#disabled.asReadonly();

  readonly #menu = signal(null as Menu | null);
  readonly isExpanded = computed(() => !!this.#menu());
  readonly isCollapsed = computed(() => !this.#menu());

  #menuOpenAction: Fn<void, [Menu]> | null = null;

  constructor() {
    inject(AriaHasPopup).set('menu');

    inject(KeyboardEvents)
      .on('ArrowDown', () => {
        const menu = this.#menu();
        if (menu) {
          menu.focusGroup.focusFirst();
        } else {
          this.#menuOpenAction = (m) => m.focusGroup.focusFirst();
          this.expand();
        }
      })
      .on('ArrowUp', () => {
        const menu = this.#menu();
        if (menu) {
          menu.focusGroup.focusLast();
        } else {
          this.#menuOpenAction = (m) => m.focusGroup.focusLast();
          this.expand();
        }
      })
      .on(
        'Escape',
        (e) => {
          if (this.isExpanded()) {
            e.preventDefault();
            this.close();
          }
        },
        {preventDefault: false, stopPropagation: false},
      )
      .on(' ', () => {
        this.toggle();
      })
      .on('Enter', () => {
        this.toggle();
      });

    effect((onCleanup) => {
      const menu = this.#menu();
      if (menu) {
        const removeControl = this.#ariaControl.add(menu.id);
        onCleanup(() => {
          removeControl();
          // Return focus to trigger when menu closes
          if (
            menu.element.contains(document.activeElement) ||
            document.activeElement === document.body
          ) {
            this.element?.focus();
          }
        });
      }
    });

    inject(OpenClose).bindTo(() => this.isExpanded());

    effect((onCleanup) => {
      if (this.disabled()) {
        return;
      }

      const content = this.triggerFor();
      if (!content) {
        return;
      }

      if (content instanceof Menu) {
        this.setMenu(content);
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
  }

  setMenu(menu: Menu) {
    this.#menu.set(menu);
    return () => this.#menu.set(null);
  }

  consumeOpenAction(): Fn<void, [Menu]> {
    const action = this.#menuOpenAction ?? ((m) => m.focusGroup.focusFirst());
    this.#menuOpenAction = null;
    return action;
  }

  toggle() {
    this.#disabled.update((d) => !d);
  }

  expand() {
    this.#disabled.set(false);
  }

  close() {
    this.#disabled.set(true);
  }

  readonly #doc = inject(DOCUMENT);
  readonly #mouseUpTriggerTimeout = new Timeout();
  readonly #mouseUpTrigger = signal(true);
  readonly allowItemClickOnMouseUp = this.#mouseUpTrigger.asReadonly();

  protected onMouseDown() {
    const expanded = this.isExpanded();
    if (expanded) {
      this.close();
      return;
    }

    this.expand();

    // mousedown -> mouseup on menu item should not trigger it within 200ms.
    this.#mouseUpTrigger.set(false);
    this.#mouseUpTriggerTimeout.set(200, () => {
      this.#mouseUpTrigger.set(true);
    });
    listener.once(
      this.#doc,
      'mouseup',
      () => {
        this.#mouseUpTriggerTimeout.clear();
        this.#mouseUpTrigger.set(false);
      },
      {injector: this.#injector},
    );
  }

  protected onFocusOut(event: FocusEvent) {
    const relatedTarget = event.relatedTarget as Node | null;
    if (
      this.isExpanded() &&
      !this.element?.contains(relatedTarget) &&
      !this.#menu()?.element.contains(relatedTarget)
    ) {
      this.close();
    }
  }
}
