import {type Signal} from '@angular/core';
import {applySignalClass} from '../internal/apply-class-signal';

export interface Source<T> extends Signal<T> {
  (): T;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export abstract class Source<T> extends Function {
  declare private readonly _source: Signal<T>;

  constructor(source: Signal<T>) {
    super();
    applySignalClass(source, new.target.prototype, '_source');
    return source as this;
  }
}
