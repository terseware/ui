import {computed, untracked, type Signal} from '@angular/core';
import {
  deepComputed,
  patchState,
  signalState,
  type DeepSignal,
  type PartialStateUpdater,
  type SignalState,
} from '@ngrx/signals';
import type {Fn} from '@terseware/ui/internal';
import {applySignalClass} from '../internal/apply-class-signal';

export interface State<T extends object> extends Signal<T> {
  (): ReturnType<DeepSignal<T>>;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export abstract class State<T extends object> extends Function {
  declare private readonly _source: DeepSignal<T>;
  declare private readonly _state: SignalState<T>;

  constructor(initialValue: T) {
    super();
    const state = signalState(initialValue);
    const source = deepComputed(state);
    applySignalClass(source, new.target.prototype, '_source');
    Object.defineProperty(source, '_state', {value: state});
    return source as this;
  }

  protected patchState(...updaters: Array<Partial<T> | PartialStateUpdater<T>>) {
    patchState(this._state, ...updaters);
  }

  asReadonly() {
    return this._source;
  }

  toValue(tracked = true): T {
    return tracked ? this._source() : untracked(() => this._source());
  }

  snapshot<U>(selector: Fn<U, [T]>, tracked = true): U {
    return selector(this.toValue(tracked));
  }

  select<U>(selector: Fn<U, [T]>): Signal<U> {
    return computed(() => selector(this._source()));
  }
}
