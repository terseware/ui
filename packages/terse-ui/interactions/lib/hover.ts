import {booleanAttribute, Directive, inject, input, linkedSignal, output} from '@angular/core';
import {DataHover} from '@terse-ui/core/attr';
import {
  OnMouseEnter,
  OnMouseLeave,
  OnPointerEnter,
  OnPointerLeave,
  OnTouchStart,
} from '@terse-ui/core/events';
import {StatePipeline} from '@terse-ui/core/utils';
import {GlobalPointerEvents} from './global-pointer-events';

/** Hover state snapshot. */
export interface HoverState {
  enabled: boolean;
  hover: boolean;
}

/**
 * Tracks pointer hover on the host element.
 *
 * Sets `data-hover` when hovered and emits `hoverChange`. Correctly
 * ignores touch-emulated mouse events on hybrid devices — touch
 * interactions never trigger hover, matching native CSS `:hover` behavior.
 *
 * Disabling hover (via `hoverEnabled` or programmatic `disable()`) clears
 * any active hover state and suppresses future events.
 *
 * Uses both `pointerenter`/`pointerleave` and `mouseenter`/`mouseleave` as
 * a fallback for environments where pointer events fire emulated mouse
 * events after a touch interaction.
 */
@Directive({
  exportAs: 'hover',
  hostDirectives: [
    DataHover,
    OnPointerEnter,
    OnPointerLeave,
    OnMouseEnter,
    OnMouseLeave,
    OnTouchStart,
  ],
})
export class Hover extends StatePipeline<HoverState> {
  readonly #global = inject(GlobalPointerEvents);
  #localIgnoreMouseEvents = false;

  /**
   * Whether hover tracking is enabled.
   *
   * When `false`, the hover state is forced to `false` and pointer/mouse
   * events are ignored. Useful for disabled elements that should not
   * show hover feedback.
   *
   * @default true
   */
  readonly hoverEnabled = input(true, {transform: booleanAttribute});

  /**
   * Emits when the hover state changes.
   *
   * Emits `true` on hover start and `false` on hover end.
   * Does not emit when hover is disabled.
   */
  readonly hoverChange = output<boolean>();

  constructor() {
    super(
      linkedSignal(() => ({enabled: this.hoverEnabled(), hover: false})),
      {transform: (s) => ({...s, hover: s.enabled ? s.hover : false})},
    );

    // Wire DataHover to reflect hover state
    inject(DataHover).append(({next}) => next(this.result.hover()));

    // Touch on this element — suppress subsequent emulated mouse events
    inject(OnTouchStart).append(({next}) => {
      this.#localIgnoreMouseEvents = true;
      next();
    });

    // Pointer events — primary hover detection
    inject(OnPointerEnter).append(({event, next}) => {
      if (this.#global.globalIgnoreMouseEvents && event.pointerType === 'mouse') {
        next();
        return;
      }
      this.#onHoverStart(event, event.pointerType);
      next();
    });

    inject(OnPointerLeave).append(({event, next}) => {
      if (this.#containsTarget(event)) {
        this.#onHoverEnd(event.pointerType);
      }
      next();
    });

    // Mouse events — fallback for touch-emulated mouse suppression
    inject(OnMouseEnter).append(({event, next}) => {
      if (!this.#localIgnoreMouseEvents && !this.#global.globalIgnoreMouseEvents) {
        this.#onHoverStart(event, 'mouse');
      }
      this.#localIgnoreMouseEvents = false;
      next();
    });

    inject(OnMouseLeave).append(({event, next}) => {
      if (this.#containsTarget(event)) {
        this.#onHoverEnd('mouse');
      }
      next();
    });
  }

  /** Programmatically enable hover tracking. */
  enable(): void {
    this.state.update((s) => ({...s, enabled: true}));
  }

  /** Programmatically disable hover tracking and clear active hover. */
  disable(): void {
    this.state.update((s) => ({...s, enabled: false}));
  }

  #onHoverStart(event: Event, pointerType: string): void {
    if (!this.result.enabled() || pointerType === 'touch' || this.result.hover()) {
      return;
    }

    if (!this.#containsTarget(event)) {
      return;
    }

    this.state.update((s) => ({...s, hover: true}));
    this.hoverChange.emit(true);
  }

  #onHoverEnd(pointerType: string): void {
    if (pointerType === 'touch' || !this.result.hover()) {
      return;
    }

    this.state.update((s) => ({...s, hover: false}));
    this.hoverChange.emit(false);
  }

  #containsTarget(event: Event): boolean {
    return (event.currentTarget as Element | null)?.contains(event.target as Element) === true;
  }
}

/**
 * Attribute directive that applies hover tracking to any element.
 *
 * Sets `data-hover` when the element is hovered by a pointer (not touch).
 * Exposes the {@link Hover} state pipeline for composing directives.
 *
 * @example
 * ```html
 * <div terseHover (terseHoverChange)="onHover($event)">Hover me</div>
 * <button terseHover [terseHoverEnabled]="!isDisabled">Conditional</button>
 * ```
 */
@Directive({
  selector: '[terseHover]',
  exportAs: 'terseHover',
  hostDirectives: [
    {
      directive: Hover,
      inputs: ['hoverEnabled:terseHoverEnabled'],
      outputs: ['hoverChange:terseHoverChange'],
    },
  ],
})
export class TerseHover {
  readonly state = inject(Hover);
}
