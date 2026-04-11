import {DestroyRef, Directive, inject, signal, type Signal} from '@angular/core';
import type {PipeOpts} from '@terseware/ui/state';

/**
 * Bitflag modifier state for a keyboard event. Combine with `|` for
 * multi-modifier combos; matching is exact, so `Modifier.Ctrl` means
 * "Ctrl held and nothing else". Pass an array to {@link Keys.on} to
 * accept any of several combos.
 */
export enum Modifier {
  None = 0,
  Ctrl = 0b0001,
  Shift = 0b0010,
  Alt = 0b0100,
  Meta = 0b1000,
}

/** A modifier combo or a list of alternative combos (any-of). */
export type ModifierInput = Modifier | Modifier[];

/**
 * How a binding identifies the key. A string literal and a signal are
 * compared case-insensitively against `event.key`; a regex is tested
 * directly. Signals are read at dispatch time, so a key can swap
 * reactively (e.g. LTR/RTL arrow flip).
 */
export type KeyInput = string | Signal<string> | RegExp;

/** Side effects run on a matched keyboard event. */
export type KeyHandler = (event: KeyboardEvent) => void;

/**
 * Options for a single {@link Keys.on} registration. Extends {@link PipeOpts}
 * so cleanup and ordering semantics match the rest of the library:
 *
 * - `destroyRef` / `manualCleanup` control auto-removal on the current
 *   injection context's destroy. Auto-cleanup is on by default.
 * - `prepend` inserts the binding at the front of the dispatch list so
 *   it runs before siblings registered earlier.
 *
 * Keyboard-specific options default to the "safe for activation keys"
 * case — `preventDefault` and `stopPropagation` are both on, and repeat
 * events are ignored. Override per-binding for keys like `Escape` that
 * need to bubble.
 */
export interface KeyBindingOpts extends PipeOpts {
  /** Call `preventDefault()` after the handler runs. Default `true`. */
  preventDefault?: boolean;
  /** Call `stopPropagation()` after the handler runs. Default `true`. */
  stopPropagation?: boolean;
  /** Skip handler if `event.repeat` is true. Default `true`. */
  ignoreRepeat?: boolean;
  /**
   * Gate predicate evaluated at dispatch time. When `false`, the handler
   * does not run and no side effects (preventDefault/stopPropagation)
   * apply — the event is treated as unmatched for this binding.
   */
  when?: () => boolean;
  /**
   * After this binding's handler runs, halt further dispatch for this
   * event — no later-registered binding on the same `Keys` instance will
   * be invoked. Combined with `prepend: true`, this is the "claim the
   * event" pattern: an outer directive prepends a binding that
   * stopImmediates to prevent inner default handlers from firing.
   * Default `false`.
   */
  stopImmediate?: boolean;
}

interface Binding {
  readonly matcher: (event: KeyboardEvent) => boolean;
  readonly handler: KeyHandler;
  readonly preventDefault: boolean;
  readonly stopPropagation: boolean;
  readonly stopImmediate: boolean;
  readonly when: (() => boolean) | undefined;
}

const DEFAULT_PREVENT_DEFAULT = true;
const DEFAULT_STOP_PROPAGATION = true;
const DEFAULT_IGNORE_REPEAT = true;

/**
 * Shared keyboard dispatch registry composed onto an interactive host.
 *
 * Multiple directives on the same host (naturally de-duplicated by
 * Angular's host-directive merge) share one `Keys` instance and one
 * `(keydown)` listener. Each directive registers its own bindings via
 * {@link Keys.on}, receives a cleanup token, and — unless it opts out —
 * is auto-unbound when its injection context is destroyed.
 *
 * Dispatch runs every matching binding in registration order. Bindings
 * inserted with `prepend: true` run before bindings inserted earlier
 * without that option, which gives inner composites a way to claim keys
 * ahead of an outer parent.
 */
@Directive({
  exportAs: 'terseKeys',
  host: {
    '(keydown)': 'dispatch($event)',
  },
})
export class Keys {
  readonly #bindings = signal<readonly Binding[]>([]);

  /** Register a handler for a key with no modifiers held. */
  on(key: KeyInput, handler: KeyHandler, opts?: KeyBindingOpts): () => void;
  /** Register a handler for an exact modifier + key combination. */
  on(
    modifiers: ModifierInput,
    key: KeyInput,
    handler: KeyHandler,
    opts?: KeyBindingOpts,
  ): () => void;
  on(...args: unknown[]): () => void {
    const parsed = this.#parse(args);
    const binding: Binding = {
      matcher: buildMatcher(parsed.modifiers, parsed.key, parsed.ignoreRepeat),
      handler: parsed.handler,
      preventDefault: parsed.preventDefault,
      stopPropagation: parsed.stopPropagation,
      stopImmediate: parsed.stopImmediate,
      when: parsed.when,
    };

    this.#bindings.update((list) => (parsed.prepend ? [binding, ...list] : [...list, binding]));

    const remove = () => {
      this.#bindings.update((list) => list.filter((b) => b !== binding));
    };

    if (!parsed.manualCleanup) {
      (parsed.destroyRef ?? inject(DestroyRef)).onDestroy(remove);
    }

    return remove;
  }

  /** Readonly view of the current bindings — useful for tests and debugging. */
  asReadonly(): Signal<readonly Binding[]> {
    return this.#bindings.asReadonly();
  }

  protected dispatch(event: KeyboardEvent): void {
    for (const binding of this.#bindings()) {
      if (binding.when && !binding.when()) continue;
      if (!binding.matcher(event)) continue;

      binding.handler(event);
      if (binding.preventDefault) event.preventDefault();
      if (binding.stopPropagation) event.stopPropagation();
      if (binding.stopImmediate) return;
    }
  }

  #parse(args: unknown[]): {
    readonly modifiers: ModifierInput;
    readonly key: KeyInput;
    readonly handler: KeyHandler;
    readonly preventDefault: boolean;
    readonly stopPropagation: boolean;
    readonly stopImmediate: boolean;
    readonly ignoreRepeat: boolean;
    readonly when: (() => boolean) | undefined;
    readonly prepend: boolean;
    readonly manualCleanup: boolean;
    readonly destroyRef: DestroyRef | undefined;
  } {
    // Modifier form is disambiguated by the first argument's type: keys are
    // strings, signals (functions), or regexes, never numbers or arrays.
    const withMods = typeof args[0] === 'number' || Array.isArray(args[0]);
    const modifiers = (withMods ? args[0] : Modifier.None) as ModifierInput;
    const key = (withMods ? args[1] : args[0]) as KeyInput;
    const handler = (withMods ? args[2] : args[1]) as KeyHandler;
    const opts = ((withMods ? args[3] : args[2]) ?? {}) as KeyBindingOpts;

    return {
      modifiers,
      key,
      handler,
      preventDefault: opts.preventDefault ?? DEFAULT_PREVENT_DEFAULT,
      stopPropagation: opts.stopPropagation ?? DEFAULT_STOP_PROPAGATION,
      stopImmediate: opts.stopImmediate ?? false,
      ignoreRepeat: opts.ignoreRepeat ?? DEFAULT_IGNORE_REPEAT,
      when: opts.when,
      prepend: opts.prepend ?? false,
      manualCleanup: opts.manualCleanup ?? false,
      destroyRef: opts.destroyRef,
    };
  }
}

function buildMatcher(
  modifiers: ModifierInput,
  key: KeyInput,
  ignoreRepeat: boolean,
): (event: KeyboardEvent) => boolean {
  return (event) => {
    if (ignoreRepeat && event.repeat) return false;
    if (!matchesModifiers(event, modifiers)) return false;
    return matchesKey(event, key);
  };
}

function eventModifiers(event: KeyboardEvent): number {
  let flags = Modifier.None;
  if (event.ctrlKey) flags |= Modifier.Ctrl;
  if (event.shiftKey) flags |= Modifier.Shift;
  if (event.altKey) flags |= Modifier.Alt;
  if (event.metaKey) flags |= Modifier.Meta;
  return flags;
}

function matchesModifiers(event: KeyboardEvent, input: ModifierInput): boolean {
  const actual = eventModifiers(event);
  if (Array.isArray(input)) {
    for (const combo of input) {
      if (actual === combo) return true;
    }
    return false;
  }
  return actual === input;
}

function matchesKey(event: KeyboardEvent, key: KeyInput): boolean {
  if (key instanceof RegExp) return key.test(event.key);
  const resolved = typeof key === 'string' ? key : key();
  return resolved.toLowerCase() === event.key.toLowerCase();
}
