/** adapted from https://medium.com/inato/expressive-error-handling-in-typescript-and-benefits-for-domain-driven-design-70726e061c86 */
export type Result<K, E> = Ok<K, E> | Error<K, E>;

export class Ok<K, E> {
  readonly value: K;

  constructor(value: K) {
    this.value = value;
  }

  isOk(): this is Ok<K, E> {
    return true;
  }

  isError(): this is Error<K, E> {
    return false;
  }

  alsoOnOk(func: (k: K) => void): Result<K, E> {
    func(this.value)
    return this
  }

  alsoOnError(func: (e: E) => void): Result<K, E> {
    return this;
  }

  mapOk<B>(func: (k: K) => Result<B, E>): Result<B, E> {
    return func(this.value)
  }

  mapError<B>(func: (e: E) => Result<K, B>): Result<K, B> {
    return (this as unknown) as Error<K,B>;
  }
}

export class Error<K, E> {
  readonly value: E;

  constructor(value: E) {
    this.value = value;
  }

  isOk(): this is Ok<K, E> {
    return false;
  }

  isError(): this is Error<K, E> {
    return true;
  }

  alsoOnOk(func: (k: K) => void): Result<K, E> {
    return this;
  }

  alsoOnError(func: (e: E) => void): Result<K, E> {
    func(this.value)
    return this
  }

  mapOk<B>(func: (k: K) => Result<B, E>): Result<B, E> {
    return (this as unknown) as Error<B,E>;
  }

  mapError<B>(func: (e: E) => Result<K, B>): Result<K, B> {
    return func(this.value)
  }
}

export const ok = <K, E>(k: K): Result<K, E> => {
  return new Ok<K, E>(k);
};

export const error = <K, E>(e: E): Result<K, E> => {
  return new Error<K, E>(e);
};