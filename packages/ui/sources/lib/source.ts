import {
  computed,
  effect,
  untracked,
  type CreateEffectOptions,
  type EffectRef,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import {isUndefined} from '@terseware/ui/internal';

export type SourceBinding<T> = (current: T) => T | undefined;

abstract class BaseSource<T> extends Function {
  protected abstract readonly _source: WritableSignal<T>;

  constructor() {
    super();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const func = (new.target as any).prototype['toValue'];
    const apply = (): T => func.apply(apply);
    Object.setPrototypeOf(apply, new.target.prototype);
    Object.getOwnPropertyNames(func).forEach((p) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      Object.defineProperty(apply, p, Object.getOwnPropertyDescriptor(func, p)!);
    });
    return apply as unknown as (() => T) & this;
  }
}

export abstract class Source<T> extends BaseSource<T> {
  protected override readonly _source: WritableSignal<T>;

  constructor(source: WritableSignal<T>) {
    super();
    this._source = source;
  }

  toValue(tracked = true): T {
    return tracked ? this._source() : untracked(() => this._source());
  }

  asReadonly(): Signal<T> {
    return this._source.asReadonly();
  }

  protected set(value: T) {
    this._source.set(value);
  }

  protected update(updateFn: (value: T) => T) {
    this._source.update(updateFn);
  }

  protected bindSource(fn: SourceBinding<T>, options?: CreateEffectOptions) {
    const bindingValue = computed(() => fn(this._source()));
    return effect(() => {
      const value = bindingValue();
      if (!isUndefined(value)) {
        this._source.set(value);
      }
    }, options);
  }
}

export abstract class PublicSource<T> extends Source<T> {
  override set(value: T): void {
    super.set(value);
  }
  override update(updateFn: (value: T) => T): void {
    super.update(updateFn);
  }
  override bindSource(fn: SourceBinding<T>, options?: CreateEffectOptions): EffectRef {
    return super.bindSource(fn, options);
  }
}
