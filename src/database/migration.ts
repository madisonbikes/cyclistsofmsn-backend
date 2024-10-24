import { z } from "zod";
import { authenticatedUserSchema } from "../routes/contract";

export const databaseUserSchema = authenticatedUserSchema
  .extend({
    admin: z.boolean().default(false),
  })
  .transform((u) => {
    if (u.roles.find((r) => r === "admin") !== undefined) {
      u.admin = true;
    }
    return u;
  });
