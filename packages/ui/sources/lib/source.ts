import type {Signal} from '@angular/core';

export abstract class Source<T> extends Function {
  abstract source: Signal<T>;

  toValue() {
    return this.source();
  }

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
