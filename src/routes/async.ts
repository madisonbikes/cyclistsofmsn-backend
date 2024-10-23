import { Request, Response, NextFunction, RequestHandler } from "express";

export const asyncWrapper = (
  fn: (
    req: Request,
    res: Response,
    next: NextFunction,
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  ) => Promise<Response | void>,
): RequestHandler => {
  return (req, res, next) => {
    // eslint-disable-next-line @typescript-eslint/use-unknown-in-catch-callback-variable, promise/no-callback-in-promise
    return fn(req, res, next).catch(next);
  };
};
