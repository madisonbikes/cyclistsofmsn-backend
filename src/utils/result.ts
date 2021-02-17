/** adapted from https://medium.com/inato/expressive-error-handling-in-typescript-and-benefits-for-domain-driven-design-70726e061c86 */
export type Result<L, A> = Ok<L, A> | Error<L, A>;

export class Ok<L, A> {
  readonly value: L;

  constructor(value: L) {
    this.value = value;
  }

  isOk(): this is Ok<L, A> {
    return true;
  }

  isError(): this is Error<L, A> {
    return false;
  }
}

export class Error<L, A> {
  readonly value: A;

  constructor(value: A) {
    this.value = value;
  }

  isOk(): this is Ok<L, A> {
    return false;
  }

  isError(): this is Error<L, A> {
    return true;
  }
}

export const ok = <L, A>(l: L): Result<L, A> => {
  return new Ok(l);
};

export const error = <L, A>(a: A): Result<L, A> => {
  return new Error<L, A>(a);
};