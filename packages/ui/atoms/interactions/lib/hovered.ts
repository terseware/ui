import {
  booleanAttribute,
  computed,
  Directive,
  DOCUMENT,
  inject,
  Injectable,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import {listener} from '@signality/core';
import {Timeout} from '@terseware/ui/internal';
import {PublicWritableSource, WritableSource} from '@terseware/ui/state';

@Injectable({providedIn: 'root'})
class GlobalPointerEvents {
  #globalIgnoreMouseEvents = false;
  readonly #touchTimeout = new Timeout();

  get globalIgnoreMouseEvents(): boolean {
    return this.#globalIgnoreMouseEvents;
  }

  constructor() {
    const doc = inject(DOCUMENT);
    listener.capture.passive(doc, 'pointerup', this.#onGlobalPointerUp.bind(this));
    listener.capture.passive(doc, 'touchend', this.#ignoreEmulatedMouse.bind(this));
  }

  #ignoreEmulatedMouse(): void {
    this.#globalIgnoreMouseEvents = true;
    this.#touchTimeout.set(50, () => (this.#globalIgnoreMouseEvents = false));
  }

  #onGlobalPointerUp(event: PointerEvent): void {
    if (event.pointerType === 'touch') {
      this.#ignoreEmulatedMouse();
    }
  }
}

@Directive({
  exportAs: 'hoverDisabled',
})
export class HoverDisabled extends PublicWritableSource<boolean> {
  readonly hoverDisabled = input(false, {transform: booleanAttribute});
  constructor() {
    super(linkedSignal(() => this.hoverDisabled()));
  }
}

@Directive({
  exportAs: 'hovered',
  hostDirectives: [HoverDisabled],
  host: {
    '[attr.data-hover]': 'dataHoverAttr()',
    '(pointerenter)': 'onPointerEnter($event)',
    '(pointerleave)': 'onPointerLeave($event)',
    '(touchstart)': 'onTouchStart()',
    '(mouseenter)': 'onMouseEnter($event)',
    '(mouseleave)': 'onMouseLeave($event)',
  },
})
export class Hovered extends WritableSource<boolean> {
  readonly #global = inject(GlobalPointerEvents);
  #localIgnoreMouseEvents = false;

  constructor() {
    super(signal(false));
  }

  readonly disabled = inject(HoverDisabled);
  readonly dataHoverAttr = computed(() => (this.disabled() ? null : this.toValue() ? '' : null));

  #onHoverBegin(event: Event, pointerType: string): void {
    if (this.disabled() || pointerType === 'touch' || this.toValue()) {
      return;
    }

    if (!(event.currentTarget as Element | null)?.contains(event.target as Element)) {
      return;
    }

    this.set(true);
  }

  #onHoverFinished(pointerType: string): void {
    if (pointerType === 'touch' || !this.toValue()) {
      return;
    }

    this.set(false);
  }

  protected onPointerEnter(event: PointerEvent): void {
    if (this.#global.globalIgnoreMouseEvents && event.pointerType === 'mouse') {
      return;
    }

    this.#onHoverBegin(event, event.pointerType);
  }

  protected onPointerLeave(event: PointerEvent): void {
    if ((event.currentTarget as Element | null)?.contains(event.target as Element)) {
      this.#onHoverFinished(event.pointerType);
    }
  }

  protected onTouchStart(): void {
    this.#localIgnoreMouseEvents = true;
  }

  protected onMouseEnter(event: MouseEvent): void {
    if (!this.#localIgnoreMouseEvents && !this.#global.globalIgnoreMouseEvents) {
      this.#onHoverBegin(event, 'mouse');
    }

    this.#localIgnoreMouseEvents = false;
  }

  protected onMouseLeave(event: MouseEvent): void {
    if ((event.currentTarget as Element | null)?.contains(event.target as Element)) {
      this.#onHoverFinished('mouse');
    }
  }
}
