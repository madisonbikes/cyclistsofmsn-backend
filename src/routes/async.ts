import { Request, Response, NextFunction, RequestHandler } from "express";

export const asyncWrapper = (
  fn: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<Response | void>,
): RequestHandler => {
  return (req, res, next) => {
    // eslint-disable-next-line promise/no-callback-in-promise
    return fn(req, res, next).catch(next);
  };
};
