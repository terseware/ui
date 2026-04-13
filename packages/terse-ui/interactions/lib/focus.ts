import {booleanAttribute, Directive, inject, input, linkedSignal, output} from '@angular/core';
import {DataFocus, DataFocusVisible} from '@terse-ui/core/attr';
import {OnBlur, OnFocus} from '@terse-ui/core/events';
import {injectElement, StatePipeline} from '@terse-ui/core/utils';
import {InputModality, type InputModalityValue} from './input-modality';

/** Focus state snapshot — `focus` carries the origin modality. */
export interface FocusState {
  enabled: boolean;
  focus: InputModalityValue;
  focusVisible: boolean;
}

/**
 * Tracks focus and focus-visible on the host element.
 *
 * Sets `data-focus` to the origin modality (`keyboard`/`mouse`/`touch`/`program`)
 * so consumers can style focus rings per input source. Sets `data-focus-visible`
 * when the browser's `:focus-visible` heuristic matches — use this for keyboard-only
 * focus rings.
 *
 * Disabling focus tracking (via `focusEnabled` or programmatic `disable()`) clears
 * any active focus state and suppresses future events. The element itself remains
 * focusable — this only controls the tracked state and data attributes.
 */
@Directive({
  exportAs: 'focus',
  hostDirectives: [DataFocus, DataFocusVisible, OnFocus, OnBlur],
})
export class Focus extends StatePipeline<FocusState> {
  readonly #element = injectElement();
  readonly #modality = inject(InputModality);

  /**
   * Whether focus tracking is enabled.
   *
   * When `false`, focus state is forced to `null`/`false` and focus/blur
   * events are ignored. The element remains focusable in the DOM — this
   * only suppresses the tracked state and data attributes.
   *
   * @default true
   */
  readonly focusEnabled = input(true, {transform: booleanAttribute});

  /**
   * Emits the input modality on focus, `null` on blur.
   *
   * Values: `'keyboard'` | `'mouse'` | `'touch'` | `'program'` | `null`.
   */
  readonly focusChange = output<InputModalityValue>();

  /**
   * Emits `true` when `:focus-visible` matches, `false` on blur.
   *
   * Use to drive keyboard-only focus ring visibility from a parent component.
   */
  readonly focusVisibleChange = output<boolean>();

  constructor() {
    super(
      linkedSignal(() => ({
        enabled: this.focusEnabled(),
        focus: null as InputModalityValue,
        focusVisible: false,
      })),
      {
        transform: (s) => ({
          ...s,
          focus: s.enabled ? s.focus : null,
          focusVisible: s.enabled ? s.focusVisible : false,
        }),
      },
    );

    // Wire data attributes to reflect focus state
    inject(DataFocus).append(({next}) => next(this.result.focus()));
    inject(DataFocusVisible).append(({next}) => next(this.result.focusVisible()));

    inject(OnFocus).append(({event, next}) => {
      if (this.result.enabled()) {
        const target = event.target as HTMLElement | null;
        const modality = this.#modality.consume();
        const focusVisible = target?.matches(':focus-visible') === true;
        this.#patchState({focus: modality, focusVisible});
        this.focusChange.emit(modality);
        this.focusVisibleChange.emit(focusVisible);
      }
      next();
    });

    inject(OnBlur).append(({next}) => {
      if (this.result.enabled()) {
        this.#patchState({focus: null, focusVisible: false});
        this.focusChange.emit(null);
        this.focusVisibleChange.emit(false);
      }
      next();
    });
  }

  /** Programmatically enable focus tracking. */
  enable(): void {
    this.state.update((s) => ({...s, enabled: true}));
  }

  /** Programmatically disable focus tracking and clear active state. */
  disable(): void {
    this.state.update((s) => ({...s, enabled: false}));
  }

  /**
   * Programmatically focus the host element.
   *
   * Marks the focus as `'program'` modality so `data-focus="program"`
   * is set and `data-focus-visible` is not (matching browser behavior
   * where programmatic focus does not trigger `:focus-visible`).
   */
  focus(): void {
    this.#modality.markProgrammatic();
    this.#element.focus();
  }

  /** Programmatically blur the host element. */
  blur(): void {
    this.#element.blur();
  }

  #patchState(patch: Partial<FocusState>): void {
    this.state.update((s) => ({...s, ...patch}));
  }
}

/**
 * Attribute directive that applies focus tracking to any element.
 *
 * Sets `data-focus` with the input modality and `data-focus-visible` when
 * the browser's `:focus-visible` heuristic matches. Exposes the
 * {@link Focus} state pipeline for composing directives.
 *
 * @example
 * ```html
 * <input terseFocus (terseFocusChange)="onFocus($event)" />
 * <button terseFocus (terseFocusVisibleChange)="onVisible($event)">Click</button>
 * ```
 */
@Directive({
  selector: '[terseFocus]',
  exportAs: 'terseFocus',
  hostDirectives: [
    {
      directive: Focus,
      inputs: ['focusEnabled:terseFocus'],
      outputs: ['focusChange:terseFocusChange', 'focusVisibleChange:terseFocusVisibleChange'],
    },
  ],
})
export class TerseFocus {
  readonly state = inject(Focus);
}
