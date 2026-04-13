import {
  computed,
  isSignal,
  linkedSignal,
  signal,
  type CreateComputedOptions,
  type Injector,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import {setupContext} from '@signality/core/internal';
import {toDeepSignal, type DeepSignal} from './deep-signal';
import type {DeepReadonly, WithRequired} from './typings';
import {isUndefined} from './validators';

// ============================================================================
// Public API
// ============================================================================

/** Context passed to each state pipeline handler. */
export interface StatePipelineContext<T> {
  /**
   * Run the next handler in the pipeline, returning its result.
   * Pass an override to replace the state flowing downstream.
   */
  next(value?: T): T;

  /**
   * True if a downstream handler called `stop()`. Check after `next()`.
   * A function (not a getter) so it survives destructuring.
   */
  stopped(): boolean;

  /** Halt the pipeline — remaining handlers will not run. */
  stop(): void;
}

/** Options for creating a state pipeline. */
export interface StatePipelineOptions<T, R = T> extends CreateComputedOptions<R> {
  /** Transform the pipeline result into a different shape. */
  transform?: (value: T) => R;
}

/**
 * A handler that intercepts a state pipeline's value.
 * Return a new value, the result of `next()`, or a transformation of it.
 */
export type StatePipelineHandler<T> = (ctx: StatePipelineContext<T>) => T;

/**
 * Reactive middleware pipeline for Angular signals.
 *
 * Handlers intercept, transform, or delegate the state flowing from
 * an inner signal to a computed result. Last appended = outermost = runs first.
 *
 * @example
 * ```ts
 * // Atom — owns the state
 * class TabIndex extends StatePipeline<number> {
 *   readonly tabIndex = input(0, {transform: numberAttribute});
 *   constructor() { super(computed(() => this.tabIndex())); }
 * }
 *
 * // Composing directive — fallback pattern
 * class Button {
 *   constructor() {
 *     inject(TabIndex).append(({next}) => this.disabled() ? -1 : next() ?? 0);
 *   }
 * }
 *
 * // Composing directive — stop pattern
 * class MenuItem {
 *   constructor() {
 *     inject(Role).append(({stop}) => { stop(); return 'menuitem'; });
 *   }
 * }
 * ```
 */
export class StatePipeline<T, R = T> {
  protected readonly state: WritableSignal<T>;
  readonly result: DeepSignal<DeepReadonly<R>>;
  readonly #handlers = signal([] as StatePipelineHandler<T>[]);

  constructor(
    ...args: [T] extends [R]
      ? [R] extends [T]
        ? [input: Signal<T> | T, options?: StatePipelineOptions<T, R>]
        : [input: Signal<T> | T, options: WithRequired<StatePipelineOptions<T, R>, 'transform'>]
      : [input: Signal<T> | T, options: WithRequired<StatePipelineOptions<T, R>, 'transform'>]
  ) {
    const input = args[0];
    const options = args[1];
    const transform = options?.transform ?? ((value: T) => value as unknown as R);
    this.state = isSignal(input) ? linkedSignal(input) : signal(input);
    this.result = toDeepSignal(
      computed(() => transform(executePipeline(this.#handlers(), this.state())), options) as Signal<
        DeepReadonly<R>
      >,
    );
  }

  /** Append a handler (outermost — runs first). */
  append(handler: StatePipelineHandler<DeepReadonly<T>>, opts?: {injector?: Injector}): () => void {
    return this.#use(handler as StatePipelineHandler<T>, {...opts, position: 'append'});
  }

  /**
   * Prepend a handler (innermost — runs last, closest to state).
   * Prefer {@link append} unless you need to provide a base value.
   */
  prepend(
    handler: StatePipelineHandler<DeepReadonly<T>>,
    opts?: {injector?: Injector},
  ): () => void {
    return this.#use(handler as StatePipelineHandler<T>, {...opts, position: 'prepend'});
  }

  #use(
    handler: StatePipelineHandler<T>,
    opts?: {injector?: Injector; position: 'append' | 'prepend'},
  ): () => void {
    const {runInContext} = setupContext(opts?.injector, this.#use.bind(this));
    return runInContext(({onCleanup}) => {
      const position = opts?.position ?? 'append';
      this.#handlers.update((h) => (position === 'prepend' ? [handler, ...h] : [...h, handler]));

      const remove = () => {
        this.#handlers.update((h) => {
          const idx = h.indexOf(handler);
          if (idx === -1) return h;
          const copy = h.slice();
          copy.splice(idx, 1);
          return copy;
        });
      };

      onCleanup(remove);
      return remove;
    });
  }
}

// ============================================================================
// Internal
// ============================================================================

/**
 * Run handlers from outermost to innermost. `next()` delegates inward;
 * `stop()` halts further delegation. Falls back to state when no handlers remain.
 */
function executePipeline<T>(handlers: StatePipelineHandler<T>[], state: T): T {
  let stopped = false;

  const execute = (index: number, current: T): T => {
    if (stopped || index < 0) return current;

    return (
      handlers[index]?.({
        next: (override?: T) =>
          execute(index - 1, !isUndefined(override) ? override : current),
        stopped: () => stopped,
        stop() {
          stopped = true;
        },
      }) ?? current
    );
  };

  return execute(handlers.length - 1, state);
}
