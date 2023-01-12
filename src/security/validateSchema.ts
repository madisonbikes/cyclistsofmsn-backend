import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { logger } from "../utils";

type Middleware = (
  request: Request,
  response: Response,
  next: NextFunction
) => Promise<void>;

/** validate the request body against the supplied schema, placing validated object into the request.validated property */
export const validateBodySchema = <T extends z.ZodTypeAny>(
  schema: T
): Middleware => {
  return (request, response, next) => {
    const parseResult = schema.safeParse(request.body);
    if (parseResult.success) {
      request.validated = parseResult.data;
      next();
    } else {
      request.validated = undefined;
      logger.debug(parseResult.error.issues, "invalid body");
      response.status(400).send(parseResult.error.issues);
    }
    return Promise.resolve();
  };
};

/** validate the request query against the supplied schema, placing validated object into the request.validated property */
export const validateQuerySchema = <T extends z.ZodTypeAny>(
  schema: T
): Middleware => {
  return (request, response, next) => {
    const parseResult = schema.safeParse(request.query);
    if (parseResult.success) {
      request.validated = parseResult.data;
      next();
    } else {
      logger.debug(parseResult.error.issues, "invalid query");
      request.validated = undefined;
      response.status(400).send(parseResult.error.issues);
    }
    return Promise.resolve();
  };
};
