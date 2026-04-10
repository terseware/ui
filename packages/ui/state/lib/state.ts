import {
  computed,
  effect,
  untracked,
  type CreateEffectOptions,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import {isFunction, isUndefined, type Fn} from '@terseware/ui/internal';
import {applySignalClass} from '../internal/apply-class-signal';

export interface State<S, Convert = S> extends Signal<Convert> {
  (): Convert;
}

/**
 * Writable reactive state with a callable signal surface. Instances ARE the
 * readonly signal — calling them returns the current value. Mutation is
 * `protected`; extend {@link S} to expose `set`/`update`/`control`.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export abstract class State<S, Convert = S> extends Function {
  declare private readonly _source: Signal<Convert>;
  declare private readonly _state: WritableSignal<S>;
  declare protected readonly convert: (s: S) => Convert;

  constructor(
    ...args: [S] extends [Convert]
      ? [Convert] extends [S]
        ? [state: WritableSignal<S>, convert?: (s: NoInfer<S>) => Convert]
        : [state: WritableSignal<S>, convert: (s: NoInfer<S>) => Convert]
      : [state: WritableSignal<S>, convert: (s: NoInfer<S>) => Convert]
  ) {
    super();
    const state = args[0];
    const convert = args[1] ?? ((e: S) => e);
    const source = computed(() => convert(state()));
    applySignalClass(source, new.target.prototype, '_source');
    Object.defineProperty(source, '_state', {value: state});
    Object.defineProperty(source, 'convert', {value: convert});
    return source as unknown as Signal<S> & this;
  }

  /** Read the current value; pass `false` to read untracked. */
  value(tracked = true): Convert {
    return tracked ? this._source() : untracked(() => this._source());
  }

  /** The readonly signal view. */
  asReadonly(): Signal<Convert> {
    return this._source;
  }

  /** Apply `selector` to the current value without creating a computed. */
  snapshot<U>(selector: Fn<U, [Convert]>, tracked = true): U {
    return selector(this.value(tracked));
  }

  /** Derive a computed signal via `selector`. */
  select<U>(selector: Fn<U, [Convert]>): Signal<U> {
    return computed(() => selector(this._source()));
  }

  protected set(value: S) {
    this._state.set(value);
  }

  protected update(updateFn: (value: S) => S) {
    this._state.update(updateFn);
  }

  /** Shallow-merge a partial (or a function returning one) into object state. */
  protected patch(patch: Partial<S>): void;
  protected patch(fn: Fn<S, [Partial<S>]>): void;
  protected patch(fn: Partial<S> | Fn<S, [Partial<S>]>): void {
    this._state.update((e) => ({...e, ...(isFunction(fn) ? fn(e) : fn)}));
  }

  protected stateValue(tracked = true): S {
    return tracked ? this._state() : untracked(() => this._state());
  }

  /**
   * Reactive filter effect. `fn` runs on every dependency change and writes
   * its result back into state; returning `undefined` leaves state alone.
   */
  protected link(fn: (s: S) => S | undefined, options?: CreateEffectOptions & {track?: boolean}) {
    const bindingValue = computed(() => fn(this.stateValue(options?.track ?? true)));
    return effect(() => {
      const value = bindingValue();
      if (!isUndefined(value)) {
        this._state.set(value);
      }
    }, options);
  }
}
