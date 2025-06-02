import { type AuthenticatedUser } from "../routes/contract/index.js";
import { logger } from "../utils/index.js";
import { type ExpressMiddleware } from "./authentication.js";

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
