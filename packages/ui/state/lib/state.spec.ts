import {Directive} from '@angular/core';
import {render} from '@testing-library/angular';
import {State} from './state';

interface CounterState {
  count: number;
  label: string;
}

@Directive({
  selector: '[testState]',
  exportAs: 'testState',
})
class TestState extends State<CounterState> {
  constructor() {
    super({count: 0, label: 'initial'});
  }

  increment() {
    this.patchState({count: this.snapshot((s) => s.count, false) + 1});
  }

  setLabel(label: string) {
    this.patchState({label});
  }
}

function setup() {
  return render(`<div testState></div>`, {imports: [TestState]});
}

function getState(fixture: Awaited<ReturnType<typeof setup>>['fixture']) {
  return fixture.debugElement.children[0].injector.get(TestState);
}

describe('State', () => {
  describe('callable as function', () => {
    it('should return the full state value', async () => {
      const {fixture} = await setup();
      const state = getState(fixture);

      expect(state()).toEqual({count: 0, label: 'initial'});
    });

    it('should be an instance of the subclass', async () => {
      const {fixture} = await setup();
      const state = getState(fixture);

      expect(state).toBeInstanceOf(TestState);
      expect(state).toBeInstanceOf(State);
    });
  });

  describe('toValue', () => {
    it('should return current value (tracked)', async () => {
      const {fixture} = await setup();
      const state = getState(fixture);

      expect(state.toValue()).toEqual({count: 0, label: 'initial'});
    });

    it('should return current value (untracked)', async () => {
      const {fixture} = await setup();
      const state = getState(fixture);

      expect(state.toValue(false)).toEqual({count: 0, label: 'initial'});
    });
  });

  describe('snapshot', () => {
    it('should snapshot a slice of state', async () => {
      const {fixture} = await setup();
      const state = getState(fixture);

      expect(state.snapshot((s) => s.count)).toBe(0);
      expect(state.snapshot((s) => s.label)).toBe('initial');
    });
  });

  describe('patchState', () => {
    it('should patch a single property', async () => {
      const {fixture} = await setup();
      const state = getState(fixture);

      state.setLabel('updated');
      expect(state()).toEqual({count: 0, label: 'updated'});
    });

    it('should patch multiple properties', async () => {
      const {fixture} = await setup();
      const state = getState(fixture);

      state.increment();
      state.setLabel('one');
      expect(state()).toEqual({count: 1, label: 'one'});
    });

    it('should reflect patches through snapshot', async () => {
      const {fixture} = await setup();
      const state = getState(fixture);

      state.increment();
      state.increment();
      expect(state.snapshot((s) => s.count)).toBe(2);
    });
  });

  describe('source', () => {
    it('should return the deep signal source', async () => {
      const {fixture} = await setup();
      const state = getState(fixture);

      const src = state.asReadonly();
      expect(src()).toEqual({count: 0, label: 'initial'});

      state.increment();
      expect(src()).toEqual({count: 1, label: 'initial'});

      expect(state.asReadonly().count()).toBe(1);
    });
  });

  describe('subclass methods', () => {
    it('should expose custom methods on the instance', async () => {
      const {fixture} = await setup();
      const state = getState(fixture);

      expect(typeof state.increment).toBe('function');
      expect(typeof state.setLabel).toBe('function');
    });

    it('should work end-to-end with custom methods', async () => {
      const {fixture} = await setup();
      const state = getState(fixture);

      state.increment();
      state.increment();
      state.increment();
      state.setLabel('three');

      expect(state()).toEqual({count: 3, label: 'three'});
    });
  });
});
