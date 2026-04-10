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

/** Filter applied by {@link State.control} — return `undefined` to leave state unchanged. */
export type ControlBinding<T> = (current: T) => T | undefined;

/** Callable signal instance produced by {@link State}. */
export interface State<T> extends Signal<T> {
  (): T;
}

/**
 * Writable reactive state with a callable signal surface. Instances ARE the
 * readonly signal — calling them returns the current value. Mutation is
 * `protected`; extend {@link PublicState} to expose `set`/`update`/`control`.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export abstract class State<T> extends Function {
  declare private readonly _source: Signal<T>;
  declare private readonly _state: WritableSignal<T>;

  constructor(state: WritableSignal<T>) {
    super();
    const source = state.asReadonly();
    applySignalClass(source, new.target.prototype, '_source');
    Object.defineProperty(source, '_state', {value: state});
    return source as unknown as Signal<T> & this;
  }

  /** Read the current value; pass `false` to read untracked. */
  toValue(tracked = true): T {
    return tracked ? this._state() : untracked(() => this._state());
  }

  /** The readonly signal view. */
  asReadonly(): Signal<T> {
    return this._source;
  }

  /** Apply `selector` to the current value without creating a computed. */
  snapshot<U>(selector: Fn<U, [T]>, tracked = true): U {
    return selector(this.toValue(tracked));
  }

  /** Derive a computed signal via `selector`. */
  select<U>(selector: Fn<U, [T]>): Signal<U> {
    return computed(() => selector(this._source()));
  }

  protected set(value: T) {
    this._state.set(value);
  }

  protected update(updateFn: (value: T) => T) {
    this._state.update(updateFn);
  }

  /** Shallow-merge a partial (or a function returning one) into object state. */
  protected patch(patch: Partial<T>): void;
  protected patch(fn: Fn<T, [Partial<T>]>): void;
  protected patch(fn: Partial<T> | Fn<T, [Partial<T>]>): void {
    this._state.update((e) => ({...e, ...(isFunction(fn) ? fn(e) : fn)}));
  }

  /**
   * Reactive filter effect. `fn` runs on every dependency change and writes
   * its result back into state; returning `undefined` leaves state alone.
   */
  protected control(fn: ControlBinding<T>, options?: CreateEffectOptions & {track?: boolean}) {
    const bindingValue = computed(() => fn(this.toValue(options?.track ?? true)));
    return effect(() => {
      const value = bindingValue();
      if (!isUndefined(value)) {
        this._state.set(value);
      }
    }, options);
  }
}

/** {@link State} with `set`/`update`/`control` exposed publicly. */
export abstract class PublicState<T> extends State<T> {
  override readonly set = super.set.bind(this);
  override readonly update = super.update.bind(this);
  override readonly control = super.control.bind(this);
}
