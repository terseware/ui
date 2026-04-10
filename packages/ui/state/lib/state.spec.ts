import {
  Directive,
  EnvironmentInjector,
  runInInjectionContext,
  signal,
  type WritableSignal,
} from '@angular/core';
import {render} from '@testing-library/angular';
import {PublicState, State} from './state';

// Concrete subclass with protected access (typical atom pattern)
@Directive({
  selector: '[testSource]',
  exportAs: 'testSource',
})
class TestSource extends PublicState<number> {
  constructor() {
    super(signal(0));
  }
}

// Concrete subclass with public access
@Directive({
  selector: '[testPublicSource]',
  exportAs: 'testPublicSource',
})
class TestPublicSource extends PublicState<string> {
  constructor() {
    super(signal('initial'));
  }
}

describe('Source', () => {
  describe('callable as function', () => {
    it('should be callable and return the signal value', async () => {
      const {fixture} = await render(`<div testSource></div>`, {
        imports: [TestSource],
      });
      const source = fixture.debugElement.children[0].injector.get(TestSource);

      expect(source()).toBe(0);
    });

    it('should be an instance of Source', async () => {
      const {fixture} = await render(`<div testSource></div>`, {
        imports: [TestSource],
      });
      const source = fixture.debugElement.children[0].injector.get(TestSource);

      expect(source).toBeInstanceOf(TestSource);
      expect(source).toBeInstanceOf(State);
    });
  });

  describe('toValue', () => {
    it('should return current value with tracked=true (default)', async () => {
      const {fixture} = await render(`<div testSource></div>`, {
        imports: [TestSource],
      });
      const source = fixture.debugElement.children[0].injector.get(TestSource);

      expect(source.toValue()).toBe(0);
    });

    it('should return current value with tracked=false (untracked)', async () => {
      const {fixture} = await render(`<div testSource></div>`, {
        imports: [TestSource],
      });
      const source = fixture.debugElement.children[0].injector.get(TestSource);

      expect(source.toValue(false)).toBe(0);
    });
  });

  describe('asReadonly', () => {
    it('should return a readonly signal', async () => {
      const {fixture} = await render(`<div testSource></div>`, {
        imports: [TestSource],
      });
      const source = fixture.debugElement.children[0].injector.get(TestSource);

      const readonly = source.asReadonly();
      expect(readonly()).toBe(0);

      source.set(42);
      expect(readonly()).toBe(42);
    });
  });

  describe('set', () => {
    it('should update the value', async () => {
      const {fixture} = await render(`<div testSource></div>`, {
        imports: [TestSource],
      });
      const source = fixture.debugElement.children[0].injector.get(TestSource);

      source.set(99);
      expect(source()).toBe(99);
    });
  });

  describe('update', () => {
    it('should update the value using a function', async () => {
      const {fixture} = await render(`<div testSource></div>`, {
        imports: [TestSource],
      });
      const source = fixture.debugElement.children[0].injector.get(TestSource);

      source.set(10);
      source.update((v) => v + 5);
      expect(source()).toBe(15);
    });
  });

  describe('bindSource', () => {
    it('should reactively bind from an external signal', async () => {
      const external: WritableSignal<number> = signal(100);

      const {fixture} = await render(`<div testSource></div>`, {
        imports: [TestSource],
      });
      const source = fixture.debugElement.children[0].injector.get(TestSource);
      const envInjector = fixture.debugElement.children[0].injector.get(EnvironmentInjector);

      runInInjectionContext(envInjector, () => source.control(() => external()));
      fixture.detectChanges();

      expect(source()).toBe(100);

      external.set(200);
      fixture.detectChanges();

      expect(source()).toBe(200);
    });

    it('should not update when binding returns undefined', async () => {
      const external: WritableSignal<number> = signal(0);

      const {fixture} = await render(`<div testSource></div>`, {
        imports: [TestSource],
      });
      const source = fixture.debugElement.children[0].injector.get(TestSource);
      const envInjector = fixture.debugElement.children[0].injector.get(EnvironmentInjector);

      source.set(42);
      runInInjectionContext(envInjector, () =>
        source.control(() => (external() > 0 ? external() : undefined)),
      );
      fixture.detectChanges();

      // external is 0, binding returns undefined — value unchanged
      expect(source()).toBe(42);

      external.set(99);
      fixture.detectChanges();

      expect(source()).toBe(99);
    });
  });
});

describe('PublicSource', () => {
  it('should expose set publicly', async () => {
    const {fixture} = await render(`<div testPublicSource></div>`, {
      imports: [TestPublicSource],
    });
    const source = fixture.debugElement.children[0].injector.get(TestPublicSource);

    expect(source()).toBe('initial');
    source.set('updated');
    expect(source()).toBe('updated');
  });

  it('should expose update publicly', async () => {
    const {fixture} = await render(`<div testPublicSource></div>`, {
      imports: [TestPublicSource],
    });
    const source = fixture.debugElement.children[0].injector.get(TestPublicSource);

    source.update((v) => v + '!');
    expect(source()).toBe('initial!');
  });

  it('should expose bindSource publicly', async () => {
    const external = signal('bound');

    const {fixture} = await render(`<div testPublicSource></div>`, {
      imports: [TestPublicSource],
    });
    const source = fixture.debugElement.children[0].injector.get(TestPublicSource);
    const envInjector = fixture.debugElement.children[0].injector.get(EnvironmentInjector);

    runInInjectionContext(envInjector, () => source.control(() => external()));
    fixture.detectChanges();

    expect(source()).toBe('bound');
  });
});
