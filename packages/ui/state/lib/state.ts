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

export type SourceBinding<T> = (current: T) => T | undefined;

export interface State<T> extends Signal<T> {
  (): T;
}

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

  toValue(tracked = true): T {
    return tracked ? this._state() : untracked(() => this._state());
  }

  asReadonly(): Signal<T> {
    return this._source;
  }

  snapshot<U>(selector: Fn<U, [T]>, tracked = true): U {
    return selector(this.toValue(tracked));
  }

  select<U>(selector: Fn<U, [T]>): Signal<U> {
    return computed(() => selector(this._source()));
  }

  protected set(value: T) {
    this._state.set(value);
  }

  protected update(updateFn: (value: T) => T) {
    this._state.update(updateFn);
  }

  protected patch(patch: Partial<T>): void;
  protected patch(fn: Fn<T, [Partial<T>]>): void;
  protected patch(fn: Partial<T> | Fn<T, [Partial<T>]>): void {
    this._state.update((e) => ({...e, ...(isFunction(fn) ? fn(e) : fn)}));
  }

  protected bindTo(fn: SourceBinding<T>, options?: CreateEffectOptions & {track: boolean}) {
    const bindingValue = computed(() => fn(this.toValue(options?.track ?? true)));
    return effect(() => {
      const value = bindingValue();
      if (!isUndefined(value)) {
        this._state.set(value);
      }
    }, options);
  }
}

export abstract class PublicState<T> extends State<T> {
  override readonly set = super.set.bind(this);
  override readonly update = super.update.bind(this);
  override readonly bindTo = super.bindTo.bind(this);
}
