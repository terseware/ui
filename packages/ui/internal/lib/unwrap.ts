import type {Injector} from '@angular/core';
import {runInInjectionContext} from '@angular/core';
import {deepMerge} from './deep-merge';
import type {DeepPartial, MaybeFn, MaybeProp} from './typings';
import {isFunction} from './validators';

/**
 * Returns `val` as-is or calls it with `args` when it is a function.
 */
export function unwrap<T, A extends unknown[] = never[]>(val: MaybeFn<T, A>, ...args: A): T {
  return isFunction(val) ? val(...args) : val;
}

/**
 * Like {@link unwrap}, but evaluates in the provided Angular injection context.
 */
export function unwrapInject<T, A extends unknown[] = never[]>(
  inj: Injector,
  val: MaybeFn<T, A>,
  ...args: A
): T {
  return runInInjectionContext(inj, () => unwrap(val, ...args));
}

/**
 * Resolves `defaultValue` and applies {@link deepMerge} with resolved partial overrides.
 */
export function unwrapMerge<T extends object>(
  defaultValue: MaybeFn<T, []>,
  ...values: MaybeProp<DeepPartial<T>>[]
): T {
  return deepMerge(unwrap(defaultValue), ...values.map((x) => unwrap(x) ?? {})) as T;
}

/**
 * Like {@link unwrapMerge}, but resolves all values in an Angular injection context.
 */
export function unwrapMergeInject<T extends object>(
  injector: Injector,
  defaultValue: MaybeFn<T, []>,
  ...values: MaybeProp<DeepPartial<T>>[]
): T {
  return deepMerge(
    unwrapInject(injector, defaultValue),
    ...values.map((v) => unwrapInject(injector, v) ?? {}),
  ) as T;
}
