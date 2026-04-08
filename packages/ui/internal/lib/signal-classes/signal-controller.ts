import {
  computed,
  effect,
  type CreateEffectOptions,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import {isUndefined} from '../validators';
import {SignalClass} from './signal-class';

export abstract class SignalController<T> extends SignalClass<T> {
  abstract override readonly source: WritableSignal<T>;

  asReadonly(): Signal<T> {
    return this.source.asReadonly();
  }

  set(value: T) {
    this.source.set(value);
  }

  update(updateFn: (value: T) => T) {
    this.source.update(updateFn);
  }

  control(fn: (current: T) => T | undefined, options?: CreateEffectOptions) {
    const merged = computed(() => fn(this.source()));
    return effect(() => {
      const value = merged();
      if (!isUndefined(value)) {
        this.set(value);
      }
    }, options);
  }
}
