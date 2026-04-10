import {
  computed,
  Directive,
  DOCUMENT,
  effect,
  inject,
  INJECTOR,
  input,
  model,
  signal,
  TemplateRef,
  ViewContainerRef,
  type Type,
} from '@angular/core';
import {listener} from '@signality/core';
import {setupSync} from '@signality/core/browser/listener';
import {Anchor} from '@terseware/ui/anchor';
import {AriaControls, AriaHasPopup, KeyboardEvents, OpenClose} from '@terseware/ui/atoms';
import {injectElement, Timeout, type Fn} from '@terseware/ui/internal';
import {Menu} from './menu';

/** Value accepted by `menuTriggerFor`: a live `Menu`, a component type, or a template ref. */
export type MenuTriggerFor = Menu | Type<object> | TemplateRef<unknown>;

/**
 * Why a menu was closed — decides whether the close chains up the submenu stack.
 * `'escape'` closes only the current level; every other reason closes the whole chain.
 */
export type MenuTriggerCloseReason = 'click' | 'escape' | 'tab' | 'outside';

/**
 * Menu trigger behavior. The *same* directive powers top-level triggers and
 * submenu-trigger menu items — submenu mode is detected via DI (presence of
 * a parent `Menu`). Keybindings and close-chain semantics branch on that.
 * Does not compose `Button`; pair with a native `<button>` or `Button`
 * explicitly for activation semantics.
 */
@Directive({
  exportAs: 'menuTrigger',
  hostDirectives: [OpenClose, Anchor, AriaHasPopup, AriaControls, KeyboardEvents],
  host: {
    '(mousedown)': 'onMouseDown()',
    '(focusout)': 'onFocusOut($event)',
  },
})
export class MenuTrigger {
  readonly element = injectElement();
  readonly #injector = inject(INJECTOR);
  readonly #vcr = inject(ViewContainerRef);
  readonly #ariaControl = inject(AriaControls);

  readonly menuTriggerFor = input<MenuTriggerFor>();
  readonly menuOpened = model(false);

  /** The containing `Menu`, if any — drives submenu-mode detection and chain closes. */
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
      // Submenu (LTR vertical parent): ArrowRight opens, ArrowLeft closes.
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
      // Top-level: ArrowDown opens focused-first, ArrowUp opens focused-last.
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

    // Register the open menu's id on aria-controls and return focus when it closes.
    effect((onCleanup) => {
      const menu = this.#menu();
      if (menu) {
        const removeControl = this.#ariaControl.add(menu.id);
        onCleanup(() => {
          removeControl();
          if (
            menu.element.contains(document.activeElement) ||
            document.activeElement === document.body
          ) {
            this.element?.focus();
          }
        });
      }
    });

    inject(OpenClose).control(() => this.isExpanded());

    effect((onCleanup) => {
      if (!this.menuOpened()) {
        return;
      }

      const content = this.menuTriggerFor();
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
    this.menuOpened.update((d) => !d);
  }

  expand() {
    this.menuOpened.set(true);
  }

  /** Close this menu; non-`'escape'` reasons also close the parent chain. */
  close(reason: MenuTriggerCloseReason = 'click') {
    this.menuOpened.set(false);

    // Restore focus to the trigger *synchronously* before the view-destroy
    // effect runs. Otherwise the focused item inside the dying view blurs
    // with `relatedTarget=null`, and a parent menu's focus-out handler would
    // read that as "focus left the menu system" and chain-close up. Moving
    // focus here first makes relatedTarget this trigger, which the parent
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

    // Suppress the mouseup-on-item click-through race for 200ms after open.
    this.#mouseUpTrigger.set(false);
    this.#mouseUpTriggerTimeout.set(200, () => {
      this.#mouseUpTrigger.set(true);
    });
    // Document mouseup — attach synchronously from inside this mousedown
    // handler so we don't miss the release while Angular schedules the next
    // render tick.
    setupSync(() =>
      listener.once(
        this.#doc,
        'mouseup',
        () => {
          this.#mouseUpTriggerTimeout.clear();
          this.#mouseUpTrigger.set(false);
        },
        {injector: this.#injector},
      ),
    );
  }

  protected onFocusOut(event: FocusEvent) {
    // Skip transitions caused by our own scheduled close.
    if (!this.menuOpened()) return;

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
