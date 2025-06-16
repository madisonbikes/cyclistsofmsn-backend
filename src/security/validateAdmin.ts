import { validateRole } from "./validateRole.ts";

export const validateAdmin = () => {
  return validateRole({ role: "admin" });
};
