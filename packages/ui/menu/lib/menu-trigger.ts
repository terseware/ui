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
import {injectElement, Timeout, type Fn} from '@terseware/ui/internal';
import {PublicState} from '@terseware/ui/state';
import {Menu} from './menu';

export type MenuTriggerForInput = Menu | Type<object> | TemplateRef<unknown>;

/**
 * Reason a menu was closed. Determines whether the close propagates up the
 * submenu chain.
 *
 * - `'click'`   — a leaf item was activated. Closes the entire chain so the
 *                 selection returns to the original caller.
 * - `'escape'`  — Escape or ArrowLeft inside a submenu. Closes only the
 *                 current level; parent menus stay open.
 * - `'tab'`     — user tabbed away from the menu. Closes the entire chain.
 * - `'outside'` — focus or pointer left the menu system. Closes the entire chain.
 */
export type MenuTriggerCloseReason = 'click' | 'escape' | 'tab' | 'outside';

@Directive({
  exportAs: 'menuTriggerFor',
})
export class MenuTriggerFor extends PublicState<MenuTriggerForInput | undefined> {
  readonly menuTriggerFor = input<MenuTriggerForInput>();
  constructor() {
    super(linkedSignal(() => this.menuTriggerFor()));
  }
}

@Directive({
  exportAs: 'menuDisabled',
})
export class MenuDisabled extends PublicState<boolean> {
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

  /**
   * Parent menu (walked up the element injector tree). Present when this
   * trigger is rendered inside another menu — i.e., when the element also
   * carries `terseMenuItem`. Used to detect submenu mode and chain closes
   * up the menu stack.
   */
  readonly #parentMenu = inject(Menu, {optional: true});
  readonly isSubmenu = computed(() => !!this.#parentMenu);

  readonly #menu = signal(null as Menu | null);
  readonly isExpanded = computed(() => !!this.#menu());
  readonly isCollapsed = computed(() => !this.#menu());

  #menuOpenAction: Fn<void, [Menu]> | null = null;

  constructor() {
    inject(AriaHasPopup).set('menu');

    const keys = inject(KeyboardEvents);

    if (this.isSubmenu()) {
      // Submenu trigger: ArrowRight opens the child menu focused on its
      // first item, ArrowLeft closes the child (keeping the parent open).
      // Assumes LTR + vertical parent menu — horizontal menubars will need
      // orientation-aware key mapping later.
      keys
        .on('ArrowRight', () => {
          if (this.isExpanded()) return;
          this.#menuOpenAction = (m) => m.focusGroup.focusFirst();
          this.expand();
        })
        .on('ArrowLeft', () => {
          if (this.isExpanded()) {
            this.close('escape');
          }
        });
    } else {
      // Top-level trigger: ArrowDown/ArrowUp open the menu focused on the
      // first/last item respectively.
      keys
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
        });
    }

    keys
      .on(
        'Escape',
        (e) => {
          if (this.isExpanded()) {
            e.preventDefault();
            this.close('escape');
          }
        },
        {preventDefault: false, stopPropagation: false},
      )
      .on(' ', () => this.toggle())
      .on('Enter', () => this.toggle());

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

  /**
   * Closes this menu. For submenus, non-escape reasons also close the parent
   * chain so selection/tab/outside-click collapses the whole stack.
   */
  close(reason: MenuTriggerCloseReason = 'click') {
    this.#disabled.set(true);

    // Synchronously restore focus to the trigger element BEFORE the scheduled
    // view destruction effect runs. If we don't, the view tears down while
    // an item inside the menu is still focused — that dispatches a focusout
    // with `relatedTarget=null` which the parent menu's focus-out handler
    // would (incorrectly) interpret as "focus left the menu system" and
    // chain close up. By moving focus to this trigger first, the resulting
    // focusout has the trigger element as `relatedTarget`, which the parent
    // menu recognizes as "still inside me".
    const menu = this.#menu();
    if (
      menu &&
      this.element &&
      (menu.element.contains(document.activeElement) || document.activeElement === document.body)
    ) {
      this.element.focus();
    }

    if (this.isSubmenu() && reason !== 'escape') {
      this.#parentMenu?.trigger.close(reason);
    }
  }

  readonly #doc = inject(DOCUMENT);
  readonly #mouseUpTriggerTimeout = new Timeout();
  readonly #mouseUpTrigger = signal(true);
  readonly allowItemClickOnMouseUp = this.#mouseUpTrigger.asReadonly();

  protected onMouseDown() {
    const expanded = this.isExpanded();
    if (expanded) {
      this.close('escape');
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
    // Ignore focus transitions caused by our own scheduled close.
    if (this.#disabled()) return;

    const relatedTarget = event.relatedTarget as Node | null;
    if (
      this.isExpanded() &&
      !this.element?.contains(relatedTarget) &&
      !this.#menu()?.element.contains(relatedTarget)
    ) {
      this.close('outside');
    }
  }
}
