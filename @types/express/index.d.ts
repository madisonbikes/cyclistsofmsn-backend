/** add validated property to requests */
declare namespace Express {
  export interface Request {
    validated?: unknown;
    isValidated(): this is ValidatedRequest;
    isUnvalidated(): this is UnvalidatedRequest;
  }

  export interface ValidatedRequest {
    validated: unknown;
  }

  export interface UnvalidatedRequest {
    validated?: undefined;
  }
}
