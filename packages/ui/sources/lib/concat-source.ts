import {computed, signal} from '@angular/core';
import {Source} from './source';

export abstract class ConcatSource<T, M = T> extends Source<T> {
  readonly #pre = signal<(() => M)[]>([]);
  readonly #post = signal<(() => M)[]>([]);

  protected abstract merge(pre: M[], post: M[]): T;

  readonly source = computed(() => {
    const pre = this.#pre().map((s) => s());
    const post = this.#post().map((s) => s());
    return this.merge(pre, post);
  });

  pre(fn: () => M): () => void {
    this.#pre.update((sources) => [...sources, fn]);
    return () => {
      this.#pre.update((sources) => sources.filter((s) => s !== fn));
    };
  }

  post(fn: () => M): () => void {
    this.#post.update((sources) => [...sources, fn]);
    return () => {
      this.#post.update((sources) => sources.filter((s) => s !== fn));
    };
  }
}
