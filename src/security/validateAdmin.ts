import { Roles } from "./authentication";
import { validateRole } from "./validateRole";

export const validateAdmin = () => {
  return validateRole({ role: Roles.ADMIN });
};
