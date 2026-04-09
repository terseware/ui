import {linkedSignal, signal, type CreateEffectOptions, type EffectRef} from '@angular/core';
import {Source, type SourceBinding} from './source';

export abstract class ConcatSource<T, M = T> extends Source<T> {
  readonly #pre = signal<(() => M)[]>([]);
  readonly #post = signal<(() => M)[]>([]);

  protected abstract merge(pre: M[], post: M[]): T;

  constructor() {
    super(
      linkedSignal(() => {
        const pre = this.#pre().map((s) => s());
        const post = this.#post().map((s) => s());
        return this.merge(pre, post);
      }),
    );
  }

  protected pre(fn: () => M): () => void {
    this.#pre.update((sources) => [...sources, fn]);
    return () => {
      this.#pre.update((sources) => sources.filter((s) => s !== fn));
    };
  }

  protected post(fn: () => M): () => void {
    this.#post.update((sources) => [...sources, fn]);
    return () => {
      this.#post.update((sources) => sources.filter((s) => s !== fn));
    };
  }
}

export abstract class PublicConcatSource<T, M = T> extends ConcatSource<T, M> {
  override set(value: T): void {
    super.set(value);
  }

  override update(updateFn: (value: T) => T): void {
    super.update(updateFn);
  }

  override bindSource(fn: SourceBinding<T>, options?: CreateEffectOptions): EffectRef {
    return super.bindSource(fn, options);
  }

  override pre(fn: () => M): () => void {
    return super.pre(fn);
  }

  // post lest out intentionally since it overrides values from pre
}
