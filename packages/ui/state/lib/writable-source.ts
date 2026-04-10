import {
  computed,
  effect,
  untracked,
  type CreateEffectOptions,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import {isUndefined} from '@terseware/ui/internal';
import {applySignalClass} from '../internal/apply-class-signal';

export type SourceBinding<T> = (current: T) => T | undefined;

export abstract class WritableSource<T> extends Function {
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

  protected set(value: T) {
    this._state.set(value);
  }

  protected update(updateFn: (value: T) => T) {
    this._state.update(updateFn);
  }

  protected bindTo(fn: SourceBinding<T>, options?: CreateEffectOptions) {
    const bindingValue = computed(() => fn(this._state()));
    return effect(() => {
      const value = bindingValue();
      if (!isUndefined(value)) {
        this._state.set(value);
      }
    }, options);
  }
}

export abstract class PublicWritableSource<T> extends WritableSource<T> {
  override readonly set = super.set.bind(this);
  override readonly update = super.update.bind(this);
  override readonly bindTo = super.bindTo.bind(this);
}
