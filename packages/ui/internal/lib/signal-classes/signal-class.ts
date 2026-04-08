import type {Signal} from '@angular/core';

export abstract class SignalClass<T> extends Function {
  abstract source: Signal<T>;

  constructor() {
    super();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const func = (new.target as any).prototype['value'];
    const apply = (): T => func.apply(apply);
    Object.setPrototypeOf(apply, new.target.prototype);
    Object.getOwnPropertyNames(func).forEach((p) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      Object.defineProperty(apply, p, Object.getOwnPropertyDescriptor(func, p)!);
    });
    return apply as unknown as (() => T) & this;
  }
}
