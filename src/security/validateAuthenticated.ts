import { type AuthenticatedUser } from "../routes/contract/index.ts";
import { logger } from "../utils/index.ts";
import { type ExpressMiddleware } from "./authentication.ts";

export const validateAuthenticated = (): ExpressMiddleware => {
  return (request, response, next) => {
    logger.trace(request.user, "validating authenticated");
    const user = request.user as AuthenticatedUser | undefined;
    if (user === undefined) {
      response.status(401).send("requires authenticated");
    } else {
      next();
    }
  };
};
