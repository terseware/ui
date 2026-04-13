import {
  computed,
  isSignal,
  linkedSignal,
  signal,
  type CreateComputedOptions,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import {
  unwrapMerge,
  type DeepPartial,
  type DeepReadonly,
  type MaybeProp,
  type WithRequired,
} from '@terse-ui/core/utils';
import {toDeepSignal, type DeepSignal} from '@terse-ui/core/utils/lib/deep-signal';

/**
 * Configuration for {@link State}.
 *
 * @typeParam T - Internal state shape.
 * @typeParam R - Public state shape (defaults to `T`).
 */
export interface StateOptions<T, R = T> extends CreateComputedOptions<R> {
  /**
   * Derive a public shape `R` from the internal state `T`.
   *
   * Required when `T` and `R` differ. Runs inside a `computed`,
   * so any signals read here become automatic dependencies.
   */
  transform?: (value: T) => R;
}

/**
 * Reactive state container backed by an Angular signal.
 *
 * Wraps a writable signal with a read-only, deep-signal projection
 * exposed via {@link state}. Accepts a static value or an existing
 * signal as input — when a signal is provided, changes are tracked
 * via `linkedSignal`.
 *
 * Subclass this to build stateful directives. Override
 * {@link resolveState} to intercept the value before it reaches
 * the public projection (see {@link StatePipeline}).
 *
 * @typeParam T - Internal state shape.
 * @typeParam R - Public state shape (defaults to `T`).
 *
 * @example
 * ```ts
 * class Focus extends State<FocusState> {
 *   constructor() {
 *     super({focused: false, focusVisible: false});
 *   }
 * }
 *
 * // With a transform
 * class Hover extends State<HoverInner, HoverPublic> {
 *   constructor() {
 *     super({hovered: false}, {
 *       transform: (s) => ({...s, isActive: s.hovered}),
 *     });
 *   }
 * }
 * ```
 */
export class State<T, R = T> {
  /** The mutable inner signal. */
  protected readonly innerState: WritableSignal<T>;

  /** Read-only deep-signal projection of the resolved, transformed state. */
  readonly state: DeepSignal<DeepReadonly<R>>;

  constructor(
    ...args: [T] extends [R]
      ? [R] extends [T]
        ? [input: Signal<T> | T, options?: StateOptions<T, R>]
        : [input: Signal<T> | T, options: WithRequired<StateOptions<T, R>, 'transform'>]
      : [input: Signal<T> | T, options: WithRequired<StateOptions<T, R>, 'transform'>]
  ) {
    const input = args[0];
    const options = args[1];
    const transform = options?.transform ?? ((value: T) => value as unknown as R);
    this.innerState = isSignal(input) ? linkedSignal(input) : signal(input);
    this.state = toDeepSignal(
      computed(() => transform(this.resolveState()), options) as Signal<DeepReadonly<R>>,
    );
  }

  /**
   * Produce the value fed into the `transform` pipeline.
   *
   * Default: returns a shallow-frozen snapshot of {@link innerState}.
   * Override in subclasses to intercept or transform the raw state
   * before it reaches the public projection.
   */
  protected resolveState(): T {
    return Object.freeze(this.innerState());
  }

  /**
   * Deep-merge a partial update into the inner state.
   *
   * Accepts a static partial or a function that receives the current
   * state and returns a partial — useful for updates that depend on
   * the previous value.
   */
  protected patchState(state: MaybeProp<DeepPartial<T>, [T]>): void {
    this.innerState.update((s) => unwrapMerge(s, state));
  }
}
