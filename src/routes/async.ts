import express, { RequestHandler } from "express";

export const asyncWrapper = (
  fn: (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => Promise<express.Response | void>
): RequestHandler => {
  return (req, res, next) => {
    // eslint-disable-next-line promise/no-callback-in-promise
    return fn(req, res, next).catch(next);
  };
};
