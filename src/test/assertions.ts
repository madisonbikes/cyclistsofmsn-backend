/** custom assertions that do a nicer job of type narrowing */

import { Error, Ok, type Result } from "../utils";
import { expect } from "vitest";

export function assertOk<T1, T2>(
  result: Result<T1, T2>,
): asserts result is Ok<T1, T2> {
  expect(result.isOk()).toEqual(true);
}

export function assertError<T1, T2>(
  result: Result<T1, T2>,
): asserts result is Error<T1, T2> {
  expect(result.isError()).toEqual(true);
}
