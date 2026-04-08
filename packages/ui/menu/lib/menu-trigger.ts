import {
  booleanAttribute,
  Directive,
  effect,
  inject,
  INJECTOR,
  input,
  linkedSignal,
  TemplateRef,
  type Type,
  ViewContainerRef,
} from '@angular/core';
import {Anchor} from '@terseware/ui/anchor';
import {AriaExpanded, AriaHasPopup} from '@terseware/ui/atoms';
import {Button} from '@terseware/ui/button';
import {ControlledSource} from '@terseware/ui/sources';

@Directive({
  exportAs: 'menuDisabled',
})
export class MenuDisabled extends ControlledSource<boolean> {
  readonly menuDisabled = input(false, {transform: booleanAttribute});
  override source = linkedSignal(() => this.menuDisabled());
}

@Directive({
  exportAs: 'menuExpanded',
  hostDirectives: [AriaExpanded],
})
export class MenuExpanded extends ControlledSource<boolean> {
  readonly #ariaExpanded = inject(AriaExpanded);
  readonly menuExpanded = input(false, {transform: booleanAttribute});
  override source = linkedSignal(() => this.menuExpanded());

  constructor() {
    super();
    this.#ariaExpanded.control(this.source);
  }

  toggle() {
    this.source.update((s) => !s);
  }
}

@Directive({
  exportAs: 'menuTriggerFor',
})
export class MenuTriggerFor extends ControlledSource<
  Type<object> | TemplateRef<unknown> | undefined
> {
  readonly menuTriggerFor = input<Type<object> | TemplateRef<unknown>>();
  override source = linkedSignal(() => this.menuTriggerFor());
}

@Directive({
  exportAs: 'menuTrigger',
  hostDirectives: [Button, Anchor, AriaHasPopup, MenuDisabled, MenuExpanded],
  host: {
    '(click)': 'expanded.toggle()',
  },
})
export class MenuTrigger {
  readonly #injector = inject(INJECTOR);
  readonly #vcr = inject(ViewContainerRef);
  readonly #ariaHasPopup = inject(AriaHasPopup);

  readonly triggerFor = inject(MenuTriggerFor);
  readonly disabled = inject(MenuDisabled);
  readonly expanded = inject(MenuExpanded);

  constructor() {
    this.#ariaHasPopup.set('menu');

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
  }
}
