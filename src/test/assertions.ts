/** custom assertions that do a nicer job of type narrowing */

import { Error, Ok, Result } from "../utils";

export const assertOk = <T1, T2>(
  result: Result<T1, T2>
): asserts result is Ok<T1, T2> => {
  expect(result.isOk()).toEqual(true);
};

export const assertError = <T1, T2>(
  result: Result<T1, T2>
): asserts result is Error<T1, T2> => {
  expect(result.isError()).toEqual(true);
};

export const assertInstanceOf = <T1>(
  value: unknown,
  type: T1
): asserts value is T1 => {
  expect(value).toBeInstanceOf(type);
};
