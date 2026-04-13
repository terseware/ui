import {computed, type Injector, signal, type Signal} from '@angular/core';
import {setupContext} from '@signality/core/internal';

export interface EventPipelineContext<E extends Event> {
  readonly event: E;
  readonly defaultPrevented: boolean;
  stopped(): boolean;
  prevent(): void;
  stop(): void;
  next(): void;
}

export type EventPipelineHandler<E extends Event> = (ctx: EventPipelineContext<E>) => void;

export class EventPipeline<E extends Event = Event> {
  readonly #handlers = signal<EventPipelineHandler<E>[]>([]);
  readonly size: Signal<number> = computed(() => this.#handlers().length);

  protected dispatch(event: E): void {
    const handlers = this.#handlers();
    if (handlers.length === 0) return;
    executeEventChain(handlers, event);
  }

  append(handler: EventPipelineHandler<E>, opts?: {injector?: Injector}): () => void {
    return this._use(handler, {...opts, position: 'append'});
  }

  prepend(handler: EventPipelineHandler<E>, opts?: {injector?: Injector}): () => void {
    return this._use(handler, {...opts, position: 'prepend'});
  }

  private _use(
    handler: EventPipelineHandler<E>,
    opts?: {injector?: Injector; position: 'append' | 'prepend'},
  ): () => void {
    const {runInContext} = setupContext(opts?.injector, this._use.bind(this));

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

function executeEventChain<E extends Event>(handlers: EventPipelineHandler<E>[], event: E): void {
  let stopped = false;
  let defaultPrevented = event.defaultPrevented;

  const execute = (index: number): void => {
    if (stopped || index < 0) return;

    handlers[index]?.({
      event,
      get defaultPrevented() {
        return defaultPrevented;
      },
      stopped: () => stopped,
      prevent() {
        if (!defaultPrevented) {
          defaultPrevented = true;
          event.preventDefault();
        }
      },
      stop() {
        stopped = true;
      },
      next() {
        if (!stopped) {
          execute(index - 1);
        }
      },
    });
  };

  execute(handlers.length - 1);
}
