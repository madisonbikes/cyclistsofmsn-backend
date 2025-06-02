import { Roles } from "./authentication.js";
import { validateRole } from "./validateRole.js";

export const validateAdmin = () => {
  return validateRole({ role: Roles.ADMIN });
};
