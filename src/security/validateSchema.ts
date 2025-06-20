import { z } from "zod/v4";
import { logger } from "../utils";
import { type ExpressMiddleware } from "./authentication";

interface ValidateOptions<T extends z.ZodType> {
  schema: T;
}

/** validate the request body against the supplied schema, placing validated object into the request.validated property */
export const validateBodySchema = <T extends z.ZodType>({
  schema,
}: ValidateOptions<T>): ExpressMiddleware => {
  return (request, response, next) => {
    logger.trace("validating body schema");
    const parseResult = schema.safeParse(request.body ?? {});
    if (parseResult.success) {
      request.validated = parseResult.data;
      next();
    } else {
      request.validated = undefined;
      logger.debug(parseResult.error.issues, "invalid body");
      response.status(400).send(parseResult.error.issues);
    }
  };
};

/** validate the request query against the supplied schema, placing validated object into the request.validated property */
export const validateQuerySchema = <T extends z.ZodType>({
  schema,
}: ValidateOptions<T>): ExpressMiddleware => {
  return (request, response, next) => {
    logger.debug("validating query schema");
    const parseResult = schema.safeParse(request.query);
    if (parseResult.success) {
      request.validated = parseResult.data;
      next();
    } else {
      logger.debug(parseResult.error.issues, "invalid query");
      request.validated = undefined;
      response.status(400).send(parseResult.error.issues);
    }
  };
};
