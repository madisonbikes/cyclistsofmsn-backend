import { type AuthenticatedUser } from "../routes/contract/index.js";
import { logger } from "../utils/index.js";
import {
  type ExpressMiddleware,
  Roles,
  userHasRole,
} from "./authentication.js";

interface ValidateOptions {
  role: Roles;
}

export const validateRole = ({ role }: ValidateOptions): ExpressMiddleware => {
  return (request, response, next) => {
    logger.trace(request.user, `validating role "${role}"`);
    const user = request.user as AuthenticatedUser | undefined;
    if (user === undefined || !userHasRole(user, role)) {
      response.status(401).send(`requires role "${role}"`);
    } else {
      next();
    }
  };
};
