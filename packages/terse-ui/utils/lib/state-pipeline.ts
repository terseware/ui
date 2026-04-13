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

// ============================================================================
// Public API
// ============================================================================

/**
 * Context provided to each pipeline handler during execution.
 *
 * @example
 * ```ts
 * pipeline.append(({next}) => {
 *   if (someCondition()) return -1;  // short-circuit
 *   return next();                    // delegate downstream
 * });
 * ```
 */
export interface StatePipelineContext<T> {
  /**
   * Delegate to the next handler in the chain.
   * If no handlers remain, returns the source value.
   *
   * @param value - Optional override value to pass downstream.
   *   When provided, downstream handlers see this as their source.
   *   When omitted, the current source value flows through.
   */
  next(value?: T): T;

  /**
   * Returns true if a downstream handler called `stop()`.
   * Call after `next()` to see if the chain was halted.
   * This is a function (not a getter) so it survives destructuring.
   */
  stopped(): boolean;

  /**
   * Halt the chain — remaining downstream handlers will not run.
   * The value returned by this handler becomes the final result.
   */
  stop(): void;
}

/**
 * Options for creating a value pipeline.
 */
export interface StatePipelineOptions<T, R = T> extends CreateComputedOptions<R> {
  /**
   * A function to transform the value after it has been processed by the pipeline.
   */
  transform?: (value: T) => R;
}

/**
 * A function that intercepts a pipeline's value.
 * Handlers execute in stack order (last registered runs first).
 *
 * @returns The value this handler produces. Can be:
 * - A new value (short-circuit)
 * - The result of `ctx.next()` (delegate)
 * - A transformation of `ctx.next()` (wrap)
 */
export type StatePipelineHandler<T> = (ctx: StatePipelineContext<T>) => T;

/**
 * A reactive middleware pipeline for Angular signals.
 *
 * Combines the Chain of Responsibility pattern with Angular's signal
 * reactivity. Handlers can intercept, transform, delegate, or
 * short-circuit the value flowing from source to result.
 *
 * Execution model:
 * - Handlers execute in **stack order** (last registered = outermost = runs first)
 * - Each handler can call `next()` to delegate to the next handler
 * - The innermost fallback returns the source signal's value
 * - The entire chain re-evaluates when any signal read by any handler changes
 *
 * @example
 * ```ts
 * // In a directive
 * class TabIndex extends StatePipeline<number> {
 *   readonly tabIndex = input(0, {transform: numberAttribute});
 *   constructor() {
 *     super(computed(() => this.tabIndex()));
 *   }
 * }
 *
 * // In a composing directive — fallback pattern
 * class Button {
 *   constructor() {
 *     inject(TabIndex).append(({next}) => {
 *       if (this.disabled()) return -1;
 *       return next() ?? 0;
 *     });
 *   }
 * }
 *
 * // In a composing directive — stop pattern
 * class MenuItem {
 *   constructor() {
 *     inject(Role).append(({stop}) => {
 *       stop();
 *       return 'menuitem';
 *     });
 *   }
 * }
 * ```
 */
export class StatePipeline<T, R = T> {
  protected readonly innerState: WritableSignal<T>;
  readonly state: DeepSignal<DeepReadonly<R>>;
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
    this.innerState = isSignal(input) ? linkedSignal(input) : signal(input);
    this.state = toDeepSignal(
      computed(
        () => transform(executeChain(this.#handlers(), this.innerState())),
        options,
      ) as Signal<DeepReadonly<R>>,
    );
  }

  /**
   * Register a handler appended to the chain.
   * Prefer this to {@link prepend} for most use cases.
   */
  append(handler: StatePipelineHandler<DeepReadonly<T>>, opts?: {injector?: Injector}): () => void {
    return this.#use(handler as StatePipelineHandler<T>, {...opts, position: 'append'});
  }

  /**
   * Register a handler prepended to the chain.
   * Use this to provide a base value that others can override.
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
 * Execute the handler chain in stack order (last handler runs first).
 *
 * Each handler receives a `next()` function that, when called,
 * executes the next handler in the chain. If `next()` is called
 * with a value, that value replaces the source for downstream handlers.
 * The innermost fallback returns the (possibly overridden) source value.
 *
 * Handlers can call `stop()` to halt the chain. When stopped,
 * subsequent `next()` calls short-circuit and return the current source.
 */
function executeChain<T>(handlers: StatePipelineHandler<T>[], sourceValue: T): T {
  let stopped = false;

  const execute = (index: number, currentSource: T): T => {
    if (stopped || index < 0) return currentSource;

    return (
      handlers[index]?.({
        next: (override?: T) =>
          execute(index - 1, override !== undefined ? override : currentSource),
        stopped: () => stopped,
        stop() {
          stopped = true;
        },
      }) ?? currentSource
    );
  };

  return execute(handlers.length - 1, sourceValue);
}
