import type {Signal} from '@angular/core';

export type Fn<T = unknown, A extends unknown[] = never[]> = (...args: A) => T;

export type MaybeFn<T = unknown, A extends unknown[] = never[]> = T | Fn<T, A>;

export type MaybeProp<T> = MaybeFn<T | null | undefined>;

export type MaybeSignal<T> = T | Signal<T>;

export type UnArray<T> = T extends (infer U)[] ? U : T;

export type OmitNever<T> = {[K in keyof T as NonNullable<T[K]> extends never ? never : K]: T[K]};

export type Pretty<T> = {[K in keyof T]: T[K]} & {};

// https://github.com/microsoft/TypeScript/issues/29729
export type Union<T, U> = T | (U & {});

declare const __brand: unique symbol;
export interface Brand<B> {
  [__brand]: B;
}
export type Branded<T, B> = T & Brand<B>;

export type Exact<T, Shape> = T extends Shape
  ? Exclude<keyof T, keyof Shape> extends never
    ? T
    : never
  : never;

export type Constructor<T extends object = object, A extends unknown[] = never[]> = A extends []
  ? new () => T
  : new (...args: A) => T;

export type AbstractConstructor<
  T extends object = object,
  A extends unknown[] = never[],
> = A extends [] ? abstract new () => T : abstract new (...args: A) => T;

export type AnyConstructor<T extends object = object, A extends unknown[] = never[]> =
  | Constructor<T, A>
  | AbstractConstructor<T, A>;

type Primitive = string | number | boolean | bigint | symbol | null | undefined;
type BuiltIn = Primitive | Date | RegExp | Error | Fn;

export type DeepPartial<T> = T extends BuiltIn
  ? T
  : T extends Map<infer K, infer V>
    ? Map<K, DeepPartial<V>>
    : T extends Set<infer U>
      ? Set<DeepPartial<U>>
      : T extends ReadonlyMap<infer K, infer V>
        ? ReadonlyMap<K, DeepPartial<V>>
        : T extends ReadonlySet<infer U>
          ? ReadonlySet<DeepPartial<U>>
          : T extends (infer U)[]
            ? DeepPartial<U>[]
            : T extends object
              ? {[P in keyof T]?: DeepPartial<T[P]>}
              : T;

export type DeepRequired<T> = T extends BuiltIn
  ? T
  : T extends Map<infer K, infer V>
    ? Map<K, DeepRequired<V>>
    : T extends Set<infer U>
      ? Set<DeepRequired<U>>
      : T extends ReadonlyMap<infer K, infer V>
        ? ReadonlyMap<K, DeepRequired<V>>
        : T extends ReadonlySet<infer U>
          ? ReadonlySet<DeepRequired<U>>
          : T extends (infer U)[]
            ? DeepRequired<U>[]
            : T extends object
              ? {[P in keyof T]-?: DeepRequired<T[P]>}
              : T;

export type IsUnknownRecord<T> = keyof T extends never
  ? true
  : string extends keyof T
    ? true
    : symbol extends keyof T
      ? true
      : number extends keyof T
        ? true
        : false;

export type IsKnownRecord<T> =
  IsRecord<T> extends true ? (IsUnknownRecord<T> extends true ? false : true) : false;

type NonRecord =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | Iterable<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | Iterable<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | WeakSet<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | WeakMap<any, any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | Promise<any>
  | Date
  | Error
  | RegExp
  | ArrayBuffer
  | DataView
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  | Function;

export type IsRecord<T> = T extends object ? (T extends NonRecord ? false : true) : false;
