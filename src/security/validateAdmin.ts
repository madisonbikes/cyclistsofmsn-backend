import { validateRole } from "./validateRole";

export const validateAdmin = () => {
  return validateRole({ role: "admin" });
};
