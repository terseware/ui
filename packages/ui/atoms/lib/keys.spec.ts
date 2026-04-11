import {
  createEnvironmentInjector,
  DestroyRef,
  Directive,
  EnvironmentInjector,
  inject,
  runInInjectionContext,
  signal,
} from '@angular/core';
import {render} from '@testing-library/angular';
import {Keys, Modifier} from './keys';

@Directive({
  selector: '[testKeys]',
  exportAs: 'testKeys',
  hostDirectives: [Keys],
})
class TestKeys {
  readonly keys = inject(Keys);
}

function dispatchKey(el: HTMLElement, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...init,
  });
  el.dispatchEvent(event);
  return event;
}

async function setup() {
  const result = await render(`<div testKeys></div>`, {imports: [TestKeys]});
  const debugEl = result.fixture.debugElement.children[0];
  const el = debugEl.nativeElement as HTMLElement;
  const parent = el.parentElement as HTMLElement;
  const keys = debugEl.injector.get(Keys);
  return {...result, el, parent, keys};
}

describe('Keys', () => {
  describe('key matching', () => {
    it('fires handler on matching string key', async () => {
      const {el, keys} = await setup();
      const spy = vi.fn();
      keys.on('Enter', spy, {manualCleanup: true});

      dispatchKey(el, 'Enter');
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('does not fire on non-matching key', async () => {
      const {el, keys} = await setup();
      const spy = vi.fn();
      keys.on('Enter', spy, {manualCleanup: true});

      dispatchKey(el, 'Escape');
      expect(spy).not.toHaveBeenCalled();
    });

    it('matches case-insensitively', async () => {
      const {el, keys} = await setup();
      const spy = vi.fn();
      keys.on('enter', spy, {manualCleanup: true});

      dispatchKey(el, 'Enter');
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('matches Space key', async () => {
      const {el, keys} = await setup();
      const spy = vi.fn();
      keys.on(' ', spy, {manualCleanup: true});

      dispatchKey(el, ' ');
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('matches via Signal<string> key', async () => {
      const {el, keys} = await setup();
      const key = signal('Enter');
      const spy = vi.fn();
      keys.on(key, spy, {manualCleanup: true});

      dispatchKey(el, 'Enter');
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('Signal<string> key updates reactively', async () => {
      const {el, keys} = await setup();
      const key = signal('Enter');
      const spy = vi.fn();
      keys.on(key, spy, {manualCleanup: true});

      dispatchKey(el, 'Enter');
      expect(spy).toHaveBeenCalledTimes(1);

      key.set('Escape');
      dispatchKey(el, 'Enter');
      expect(spy).toHaveBeenCalledTimes(1);

      dispatchKey(el, 'Escape');
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('matches via RegExp', async () => {
      const {el, keys} = await setup();
      const spy = vi.fn();
      keys.on(/^Arrow(Up|Down|Left|Right)$/, spy, {manualCleanup: true});

      dispatchKey(el, 'ArrowUp');
      dispatchKey(el, 'ArrowDown');
      dispatchKey(el, 'ArrowLeft');
      dispatchKey(el, 'ArrowRight');
      dispatchKey(el, 'Enter');
      expect(spy).toHaveBeenCalledTimes(4);
    });
  });

  describe('modifiers', () => {
    it('Modifier.None matches event with no modifiers held', async () => {
      const {el, keys} = await setup();
      const spy = vi.fn();
      keys.on(Modifier.None, 'Enter', spy, {manualCleanup: true});

      dispatchKey(el, 'Enter');
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('Modifier.None does not match when Ctrl held', async () => {
      const {el, keys} = await setup();
      const spy = vi.fn();
      keys.on(Modifier.None, 'Enter', spy, {manualCleanup: true});

      dispatchKey(el, 'Enter', {ctrlKey: true});
      expect(spy).not.toHaveBeenCalled();
    });

    it('bare on(key, handler) is equivalent to Modifier.None', async () => {
      const {el, keys} = await setup();
      const spy = vi.fn();
      keys.on('Enter', spy, {manualCleanup: true});

      dispatchKey(el, 'Enter');
      expect(spy).toHaveBeenCalledTimes(1);

      dispatchKey(el, 'Enter', {ctrlKey: true});
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('Modifier.Ctrl matches Ctrl+key exactly', async () => {
      const {el, keys} = await setup();
      const spy = vi.fn();
      keys.on(Modifier.Ctrl, 'k', spy, {manualCleanup: true});

      dispatchKey(el, 'k', {ctrlKey: true});
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('Modifier.Ctrl does not match on Ctrl+Shift+key', async () => {
      const {el, keys} = await setup();
      const spy = vi.fn();
      keys.on(Modifier.Ctrl, 'k', spy, {manualCleanup: true});

      dispatchKey(el, 'k', {ctrlKey: true, shiftKey: true});
      expect(spy).not.toHaveBeenCalled();
    });

    it('compound Ctrl+Shift matches exact combo', async () => {
      const {el, keys} = await setup();
      const spy = vi.fn();
      keys.on(Modifier.Ctrl | Modifier.Shift, 'k', spy, {manualCleanup: true});

      dispatchKey(el, 'k', {ctrlKey: true, shiftKey: true});
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('compound Ctrl+Shift does not match Ctrl alone', async () => {
      const {el, keys} = await setup();
      const spy = vi.fn();
      keys.on(Modifier.Ctrl | Modifier.Shift, 'k', spy, {manualCleanup: true});

      dispatchKey(el, 'k', {ctrlKey: true});
      expect(spy).not.toHaveBeenCalled();
    });

    it('compound Ctrl+Shift does not match Ctrl+Shift+Alt', async () => {
      const {el, keys} = await setup();
      const spy = vi.fn();
      keys.on(Modifier.Ctrl | Modifier.Shift, 'k', spy, {manualCleanup: true});

      dispatchKey(el, 'k', {ctrlKey: true, shiftKey: true, altKey: true});
      expect(spy).not.toHaveBeenCalled();
    });

    it('array form matches any of the listed combos', async () => {
      const {el, keys} = await setup();
      const spy = vi.fn();
      keys.on([Modifier.None, Modifier.Ctrl], 'Enter', spy, {manualCleanup: true});

      dispatchKey(el, 'Enter');
      expect(spy).toHaveBeenCalledTimes(1);

      dispatchKey(el, 'Enter', {ctrlKey: true});
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('array form does not match combos not in the list', async () => {
      const {el, keys} = await setup();
      const spy = vi.fn();
      keys.on([Modifier.Ctrl, Modifier.Shift], 'Enter', spy, {manualCleanup: true});

      dispatchKey(el, 'Enter', {altKey: true});
      expect(spy).not.toHaveBeenCalled();
    });

    it('empty modifier array matches nothing', async () => {
      const {el, keys} = await setup();
      const spy = vi.fn();
      keys.on([], 'Enter', spy, {manualCleanup: true});

      dispatchKey(el, 'Enter');
      dispatchKey(el, 'Enter', {ctrlKey: true});
      expect(spy).not.toHaveBeenCalled();
    });

    it('detects all four modifier keys independently', async () => {
      const {el, keys} = await setup();
      const spyCtrl = vi.fn();
      const spyShift = vi.fn();
      const spyAlt = vi.fn();
      const spyMeta = vi.fn();
      keys.on(Modifier.Ctrl, 'a', spyCtrl, {manualCleanup: true});
      keys.on(Modifier.Shift, 'a', spyShift, {manualCleanup: true});
      keys.on(Modifier.Alt, 'a', spyAlt, {manualCleanup: true});
      keys.on(Modifier.Meta, 'a', spyMeta, {manualCleanup: true});

      dispatchKey(el, 'a', {ctrlKey: true});
      dispatchKey(el, 'a', {shiftKey: true});
      dispatchKey(el, 'a', {altKey: true});
      dispatchKey(el, 'a', {metaKey: true});

      expect(spyCtrl).toHaveBeenCalledTimes(1);
      expect(spyShift).toHaveBeenCalledTimes(1);
      expect(spyAlt).toHaveBeenCalledTimes(1);
      expect(spyMeta).toHaveBeenCalledTimes(1);
    });
  });

  describe('default side effects', () => {
    it('calls preventDefault by default', async () => {
      const {el, keys} = await setup();
      keys.on('Enter', () => void 0, {manualCleanup: true});

      const event = dispatchKey(el, 'Enter');
      expect(event.defaultPrevented).toBe(true);
    });

    it('calls stopPropagation by default', async () => {
      const {el, parent, keys} = await setup();
      const parentHandler = vi.fn();
      parent.addEventListener('keydown', parentHandler);
      keys.on('Enter', () => void 0, {manualCleanup: true});

      dispatchKey(el, 'Enter');
      expect(parentHandler).not.toHaveBeenCalled();

      parent.removeEventListener('keydown', parentHandler);
    });

    it('ignores repeat events by default', async () => {
      const {el, keys} = await setup();
      const spy = vi.fn();
      keys.on('Enter', spy, {manualCleanup: true});

      dispatchKey(el, 'Enter', {repeat: true});
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('option overrides', () => {
    it('preventDefault: false leaves event default active', async () => {
      const {el, keys} = await setup();
      const spy = vi.fn();
      keys.on('Enter', spy, {preventDefault: false, manualCleanup: true});

      const event = dispatchKey(el, 'Enter');
      expect(spy).toHaveBeenCalledTimes(1);
      expect(event.defaultPrevented).toBe(false);
    });

    it('stopPropagation: false allows the event to bubble', async () => {
      const {el, parent, keys} = await setup();
      const parentHandler = vi.fn();
      parent.addEventListener('keydown', parentHandler);
      keys.on('Enter', () => void 0, {stopPropagation: false, manualCleanup: true});

      dispatchKey(el, 'Enter');
      expect(parentHandler).toHaveBeenCalledTimes(1);

      parent.removeEventListener('keydown', parentHandler);
    });

    it('ignoreRepeat: false fires on repeat events', async () => {
      const {el, keys} = await setup();
      const spy = vi.fn();
      keys.on('Enter', spy, {ignoreRepeat: false, manualCleanup: true});

      dispatchKey(el, 'Enter', {repeat: true});
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('when gate', () => {
    it('runs handler when predicate returns true', async () => {
      const {el, keys} = await setup();
      const spy = vi.fn();
      keys.on('Enter', spy, {when: () => true, manualCleanup: true});

      dispatchKey(el, 'Enter');
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('skips handler when predicate returns false', async () => {
      const {el, keys} = await setup();
      const spy = vi.fn();
      keys.on('Enter', spy, {when: () => false, manualCleanup: true});

      dispatchKey(el, 'Enter');
      expect(spy).not.toHaveBeenCalled();
    });

    it('does not preventDefault when predicate returns false', async () => {
      const {el, keys} = await setup();
      keys.on('Enter', () => void 0, {when: () => false, manualCleanup: true});

      const event = dispatchKey(el, 'Enter');
      expect(event.defaultPrevented).toBe(false);
    });

    it('does not stopPropagation when predicate returns false', async () => {
      const {el, parent, keys} = await setup();
      const parentHandler = vi.fn();
      parent.addEventListener('keydown', parentHandler);
      keys.on('Enter', () => void 0, {when: () => false, manualCleanup: true});

      dispatchKey(el, 'Enter');
      expect(parentHandler).toHaveBeenCalledTimes(1);

      parent.removeEventListener('keydown', parentHandler);
    });

    it('reactively toggles via signal-backed predicate', async () => {
      const {el, keys} = await setup();
      const enabled = signal(false);
      const spy = vi.fn();
      keys.on('Enter', spy, {when: () => enabled(), manualCleanup: true});

      dispatchKey(el, 'Enter');
      expect(spy).not.toHaveBeenCalled();

      enabled.set(true);
      dispatchKey(el, 'Enter');
      expect(spy).toHaveBeenCalledTimes(1);

      enabled.set(false);
      dispatchKey(el, 'Enter');
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('cleanup', () => {
    it('returned function removes the binding', async () => {
      const {el, keys} = await setup();
      const spy = vi.fn();
      const remove = keys.on('Enter', spy, {manualCleanup: true});

      dispatchKey(el, 'Enter');
      expect(spy).toHaveBeenCalledTimes(1);

      remove();
      dispatchKey(el, 'Enter');
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('returned function is idempotent', async () => {
      const {keys} = await setup();
      const remove = keys.on('Enter', () => void 0, {manualCleanup: true});
      expect(keys.asReadonly()().length).toBe(1);

      remove();
      remove();
      expect(keys.asReadonly()().length).toBe(0);
    });

    it('auto-cleans when the registering injection context is destroyed', async () => {
      const {fixture, keys} = await setup();
      const parentInjector = fixture.debugElement.children[0].injector.get(EnvironmentInjector);
      const child = createEnvironmentInjector([], parentInjector);

      runInInjectionContext(child, () => {
        keys.on('Enter', () => void 0);
      });

      expect(keys.asReadonly()().length).toBe(1);

      child.destroy();
      expect(keys.asReadonly()().length).toBe(0);
    });

    it('manualCleanup: true skips auto-cleanup on destroy', async () => {
      const {fixture, keys} = await setup();
      const parentInjector = fixture.debugElement.children[0].injector.get(EnvironmentInjector);
      const child = createEnvironmentInjector([], parentInjector);

      runInInjectionContext(child, () => {
        keys.on('Enter', () => void 0, {manualCleanup: true});
      });

      expect(keys.asReadonly()().length).toBe(1);

      child.destroy();
      expect(keys.asReadonly()().length).toBe(1);
    });

    it('manualCleanup: true still returns a working remove function', async () => {
      const {keys} = await setup();
      const remove = keys.on('Enter', () => void 0, {manualCleanup: true});

      expect(keys.asReadonly()().length).toBe(1);
      remove();
      expect(keys.asReadonly()().length).toBe(0);
    });

    it('explicit destroyRef is honored over ambient injection context', async () => {
      const {fixture, keys} = await setup();
      const parentInjector = fixture.debugElement.children[0].injector.get(EnvironmentInjector);
      const child = createEnvironmentInjector([], parentInjector);
      const destroyRef = child.get(DestroyRef);

      keys.on('Enter', () => void 0, {destroyRef});
      expect(keys.asReadonly()().length).toBe(1);

      child.destroy();
      expect(keys.asReadonly()().length).toBe(0);
    });
  });

  describe('ordering', () => {
    it('runs handlers in registration order', async () => {
      const {el, keys} = await setup();
      const calls: string[] = [];
      keys.on('Enter', () => calls.push('first'), {manualCleanup: true});
      keys.on('Enter', () => calls.push('second'), {manualCleanup: true});
      keys.on('Enter', () => calls.push('third'), {manualCleanup: true});

      dispatchKey(el, 'Enter');
      expect(calls).toEqual(['first', 'second', 'third']);
    });

    it('prepend: true inserts at the front', async () => {
      const {el, keys} = await setup();
      const calls: string[] = [];
      keys.on('Enter', () => calls.push('initial'), {manualCleanup: true});
      keys.on('Enter', () => calls.push('prepended'), {
        prepend: true,
        manualCleanup: true,
      });

      dispatchKey(el, 'Enter');
      expect(calls).toEqual(['prepended', 'initial']);
    });

    it('successive prepends insert in LIFO order', async () => {
      const {el, keys} = await setup();
      const calls: string[] = [];
      keys.on('Enter', () => calls.push('initial'), {manualCleanup: true});
      keys.on('Enter', () => calls.push('p1'), {prepend: true, manualCleanup: true});
      keys.on('Enter', () => calls.push('p2'), {prepend: true, manualCleanup: true});

      dispatchKey(el, 'Enter');
      expect(calls).toEqual(['p2', 'p1', 'initial']);
    });

    it('all matching handlers run, not just the first', async () => {
      const {el, keys} = await setup();
      const spyA = vi.fn();
      const spyB = vi.fn();
      const spyC = vi.fn();
      keys.on('Enter', spyA, {manualCleanup: true});
      keys.on('Enter', spyB, {manualCleanup: true});
      keys.on('Enter', spyC, {manualCleanup: true});

      dispatchKey(el, 'Enter');
      expect(spyA).toHaveBeenCalledTimes(1);
      expect(spyB).toHaveBeenCalledTimes(1);
      expect(spyC).toHaveBeenCalledTimes(1);
    });

    it('non-matching bindings do not block matching ones', async () => {
      const {el, keys} = await setup();
      const escapeSpy = vi.fn();
      const enterSpy = vi.fn();
      keys.on('Escape', escapeSpy, {manualCleanup: true});
      keys.on('Enter', enterSpy, {manualCleanup: true});

      dispatchKey(el, 'Enter');
      expect(escapeSpy).not.toHaveBeenCalled();
      expect(enterSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('overload disambiguation', () => {
    it('on(key, handler)', async () => {
      const {el, keys} = await setup();
      const spy = vi.fn();
      keys.on('Enter', spy, {manualCleanup: true});
      dispatchKey(el, 'Enter');
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('on(key, handler, opts)', async () => {
      const {el, keys} = await setup();
      const spy = vi.fn();
      keys.on('Enter', spy, {preventDefault: false, manualCleanup: true});
      const event = dispatchKey(el, 'Enter');
      expect(spy).toHaveBeenCalledTimes(1);
      expect(event.defaultPrevented).toBe(false);
    });

    it('on(modifiers, key, handler)', async () => {
      const {el, keys} = await setup();
      const spy = vi.fn();
      keys.on(Modifier.Ctrl, 'k', spy, {manualCleanup: true});
      dispatchKey(el, 'k', {ctrlKey: true});
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('on(modifiers, key, handler, opts)', async () => {
      const {el, keys} = await setup();
      const spy = vi.fn();
      keys.on(Modifier.Ctrl, 'k', spy, {preventDefault: false, manualCleanup: true});
      const event = dispatchKey(el, 'k', {ctrlKey: true});
      expect(spy).toHaveBeenCalledTimes(1);
      expect(event.defaultPrevented).toBe(false);
    });

    it('on([modifiers], key, handler) with array modifiers', async () => {
      const {el, keys} = await setup();
      const spy = vi.fn();
      keys.on([Modifier.Ctrl, Modifier.Meta], 'k', spy, {manualCleanup: true});

      dispatchKey(el, 'k', {ctrlKey: true});
      dispatchKey(el, 'k', {metaKey: true});
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  describe('host directive composition', () => {
    it('shares one Keys instance across composing directives on a host', async () => {
      @Directive({
        selector: '[composerA]',
        hostDirectives: [Keys],
      })
      class ComposerA {
        readonly keys = inject(Keys);
      }

      @Directive({
        selector: '[composerB]',
        hostDirectives: [Keys],
      })
      class ComposerB {
        readonly keys = inject(Keys);
      }

      const {fixture} = await render(`<div composerA composerB></div>`, {
        imports: [ComposerA, ComposerB],
      });
      const debugEl = fixture.debugElement.children[0];
      const a = debugEl.injector.get(ComposerA);
      const b = debugEl.injector.get(ComposerB);

      expect(a.keys).toBe(b.keys);
    });

    it('bindings from multiple composers land in one registry', async () => {
      @Directive({
        selector: '[composerA]',
        hostDirectives: [Keys],
      })
      class ComposerA {
        constructor() {
          inject(Keys).on('Enter', () => void 0);
        }
      }

      @Directive({
        selector: '[composerB]',
        hostDirectives: [Keys],
      })
      class ComposerB {
        constructor() {
          inject(Keys).on('Escape', () => void 0);
        }
      }

      const {fixture} = await render(`<div composerA composerB></div>`, {
        imports: [ComposerA, ComposerB],
      });
      const keys = fixture.debugElement.children[0].injector.get(Keys);

      expect(keys.asReadonly()().length).toBe(2);
    });

    it('bindings from composers dispatch from a single keydown listener', async () => {
      const spyA = vi.fn();
      const spyB = vi.fn();

      @Directive({
        selector: '[composerA]',
        hostDirectives: [Keys],
      })
      class ComposerA {
        constructor() {
          inject(Keys).on('Enter', spyA);
        }
      }

      @Directive({
        selector: '[composerB]',
        hostDirectives: [Keys],
      })
      class ComposerB {
        constructor() {
          inject(Keys).on('Enter', spyB);
        }
      }

      const {fixture} = await render(`<div composerA composerB></div>`, {
        imports: [ComposerA, ComposerB],
      });
      const el = fixture.debugElement.children[0].nativeElement as HTMLElement;

      dispatchKey(el, 'Enter');
      expect(spyA).toHaveBeenCalledTimes(1);
      expect(spyB).toHaveBeenCalledTimes(1);
    });
  });

  describe('asReadonly', () => {
    it('reflects current binding count', async () => {
      const {keys} = await setup();
      expect(keys.asReadonly()().length).toBe(0);

      const r1 = keys.on('Enter', () => void 0, {manualCleanup: true});
      expect(keys.asReadonly()().length).toBe(1);

      const r2 = keys.on('Escape', () => void 0, {manualCleanup: true});
      expect(keys.asReadonly()().length).toBe(2);

      r1();
      expect(keys.asReadonly()().length).toBe(1);

      r2();
      expect(keys.asReadonly()().length).toBe(0);
    });
  });
});
