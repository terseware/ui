import type {Type} from '@angular/core';

/** Type guard for string values. */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/** Type guard for number values. */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

/** Type guard for boolean values. */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/** Type guard for callable functions. */
export function isFunction(value: unknown): value is CallableFunction {
  return typeof value === 'function';
}

/** Type guard for arrays. */
export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Type guard for plain objects.
 * @remarks Excludes `null` and arrays, which also have `typeof === 'object'`.
 */
export function isObject(value: unknown): value is Record<PropertyKey, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

/** Type guard for undefined. */
export function isUndefined(value: unknown): value is undefined {
  return typeof value === 'undefined';
}

/** Type guard for null. */
export function isNull(value: unknown): value is null {
  return value === null;
}

/**
 * Type guard for null or undefined values.
 * @see {@link isNull}
 * @see {@link isUndefined}
 */
export function isNil(value: unknown): value is null | undefined {
  return isNull(value) || isUndefined(value);
}

/**
 * Type guard for not null or undefined values.
 * @see {@link isNil}
 */
export function notNil<T>(value: T | null | undefined): value is T {
  return !isNil(value);
}

/** Type guard for constructor functions (ES6 classes only). */
export function isClass(value: unknown): value is Type<object> {
  return isFunction(value) && /^\s*class[\s{]/.test(Function.prototype.toString.call(value));
}

/** Type guard for Node objects. */
export function isNode(value: unknown): value is Node {
  return value instanceof Node;
}

/** Type guard for Element objects. */
export function isElement(value: unknown): value is Element {
  return !!value && (value as Element).nodeType === Node.ELEMENT_NODE;
}

/**
 * Type guard for native `<button>` elements.
 *
 * @remarks
 * Only matches `<button>` tags—does not match `<input type="button|submit|reset">`.
 * Use this for semantic button detection; for ARIA button role detection, additional
 * checks are needed.
 */
export function isButtonElement<const E extends Element>(
  element: E,
  opts?: {types?: string[]},
): element is E & {tagName: 'BUTTON'} {
  return (
    element.tagName === 'BUTTON' &&
    (!opts?.types?.length || opts.types.includes((element as E & {type: string}).type))
  );
}

/**
 * Type guard for native `<input>` elements.
 */
export function isInputElement<const E extends Element>(
  element: E,
  opts?: {types?: string[]},
): element is E & {tagName: 'INPUT'} {
  return (
    element.tagName === 'INPUT' &&
    (!opts?.types?.length || opts.types.includes((element as E & {type: string}).type))
  );
}

/**
 * Type guard for native `<a>` elements.
 */
export function isAnchorElement<const E extends Element>(
  element: E,
  {validLink = false}: {validLink?: boolean} = {},
): element is E & {tagName: 'A'} {
  return (
    element.tagName === 'A' &&
    (!validLink ||
      !!(element as E & {href: string}).href ||
      !!(element as {routerLink?: unknown}).routerLink)
  );
}

/** Type guard for HTMLElement objects. */
export function isHTMLElement(element: unknown): element is HTMLElement {
  return element instanceof HTMLElement;
}

const TYPEABLE_SELECTOR =
  "input:not([type='hidden']):not([disabled])," +
  "[contenteditable]:not([contenteditable='false']),textarea:not([disabled])";

/**
 * Type guard for elements that can be typed into.
 */
export function isTypeableElement(element: unknown): element is HTMLElement {
  return isElement(element) && element.matches(TYPEABLE_SELECTOR);
}

/**
 * Type guard for elements supporting the native `disabled` attribute.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/disabled | MDN: disabled attribute}
 */
export function hasDisabledAttribute<E extends Element>(
  element: E,
): element is E & {disabled: boolean} {
  return isElement(element) && 'disabled' in element;
}

/**
 * Type guard for elements supporting the native `required` attribute.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/required | MDN: required attribute}
 */
export function hasRequiredAttribute<E extends Element>(
  element: E,
): element is E & {required: boolean} {
  return isElement(element) && 'required' in element;
}

/** Type guard for EventTarget objects. */
export function isEventTarget(value: unknown): value is EventTarget {
  return typeof (value as EventTarget | null)?.addEventListener === 'function';
}
