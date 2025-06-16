import { type AuthenticatedUser } from "../routes/contract";
import { logger } from "../utils";
import {
  type ExpressMiddleware,
  type Roles,
  userHasRole,
} from "./authentication";

interface ValidateOptions {
  role: Roles;
}

export const validateRole = ({ role }: ValidateOptions): ExpressMiddleware => {
  return (request, response, next) => {
    logger.trace(request.user, `validating role "%s"`, role);
    const user = request.user as AuthenticatedUser | undefined;
    if (user === undefined || !userHasRole(user, role)) {
      response.status(401).send(`requires role "${role}"`);
    } else {
      next();
    }
  };
};
