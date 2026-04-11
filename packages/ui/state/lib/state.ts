import {
  computed,
  DestroyRef,
  inject,
  signal,
  untracked,
  type CreateEffectOptions,
  type InjectOptions,
  type Signal,
  type Type,
  type WritableSignal,
} from '@angular/core';
import {isFunction, isUndefined, type Fn} from '@terseware/ui/internal';
import {applySignalClass} from '../internal/apply-class-signal';

export interface State<T, R = T> extends Signal<R> {
  (): R;
}

export type LinkStateOpts = CreateEffectOptions & {track?: boolean};

export interface PipeOpts {
  destroyRef?: DestroyRef;
  prepend?: boolean;
  manualCleanup?: boolean;
}

/**
 * Writable reactive state with a callable signal surface. Instances ARE the
 * readonly signal — calling them returns the current value. Mutation is
 * `protected`; extend {@link T} to expose `set`/`update`/`control`.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export abstract class State<T, R = T> extends Function {
  declare private readonly _source: Signal<R>;
  declare private readonly _state: WritableSignal<T>;
  declare protected readonly result: (s: T) => R;
  declare private readonly _pipes: WritableSignal<((i: T) => T)[]>;

  constructor(
    ...args: [T] extends [R]
      ? [R] extends [T]
        ? [state: WritableSignal<T>, convert?: (s: NoInfer<T>) => R]
        : [state: WritableSignal<T>, convert: (s: NoInfer<T>) => R]
      : [state: WritableSignal<T>, convert: (s: NoInfer<T>) => R]
  ) {
    super();
    const state = args[0];
    const convert = args[1] ?? ((e: T) => e);
    const pipes = signal([] as ((i: T) => T)[]);

    const source = computed(() => {
      let s = state();
      for (const fn of pipes()) s = fn(s);
      return convert(s);
    });

    applySignalClass(source, new.target.prototype, '_source');
    Object.defineProperty(source, '_state', {value: state});
    Object.defineProperty(source, '_pipes', {value: pipes});
    Object.defineProperty(source, 'convert', {value: convert});

    return source as unknown as Signal<T> & this;
  }

  /** Read the current value; pass `false` to read untracked. */
  value(tracked = true): R {
    return tracked ? this._source() : untracked(() => this._source());
  }

  /** The readonly signal view. */
  asReadonly(): Signal<R> {
    return this._source;
  }

  /** Apply `selector` to the current value without creating a computed. */
  snapshot<U>(selector: Fn<U, [R]>, tracked = true): U {
    return selector(this.value(tracked));
  }

  /** Derive a computed signal via `selector`. */
  select<U>(selector: Fn<U, [R]>): Signal<U> {
    return computed(() => selector(this._source()));
  }

  pipe(fn: (s: T) => T, opts?: PipeOpts) {
    this._pipes.update(opts?.prepend ? (p) => [fn, ...p] : (p) => [...p, fn]);
    const rm = () => this._pipes.update((p) => p.filter((x) => x !== fn));
    if (!opts?.manualCleanup) {
      (opts?.destroyRef ?? inject(DestroyRef)).onDestroy(rm);
    }
    return rm;
  }

  protected set(value: T): void {
    if (!isUndefined(value)) {
      this._state.set(value);
    }
  }

  protected update(updateFn: (value: T) => T) {
    this._state.update(updateFn);
  }

  /** Shallow-merge a partial (or a function returning one) into object state. */
  protected patch(patch: Partial<T>): void;
  protected patch(fn: Fn<T, [Partial<T>]>): void;
  protected patch(fn: Partial<T> | Fn<T, [Partial<T>]>): void {
    this._state.update((e) => ({...e, ...(isFunction(fn) ? fn(e) : fn)}));
  }

  protected stateValue(tracked = true): T {
    return tracked ? this._state() : untracked(() => this._state());
  }
}

interface Pipeable<T> {
  pipe(fn: (i: T) => T, opts?: PipeOpts): void;
}

type ExtractS<T> = T extends Pipeable<infer S> ? S : never;

export function pipe<T extends Pipeable<ExtractS<T>>>(
  type: Type<T>,
  fn: (i: ExtractS<T>) => ExtractS<T>,
  options: PipeOpts & InjectOptions & {optional: true},
): T | null;
export function pipe<T extends Pipeable<ExtractS<T>>>(
  type: Type<T>,
  fn: (i: ExtractS<T>) => ExtractS<T>,
  options?: PipeOpts & InjectOptions & {optional?: false},
): T;
export function pipe<T extends Pipeable<ExtractS<T>>>(
  type: Type<T>,
  fn: (i: ExtractS<T>) => ExtractS<T>,
  options?: PipeOpts & InjectOptions,
) {
  const instance = inject(type, options ?? {});
  instance?.pipe(fn, options);
  return instance;
}
