// database could, in theory, not have fs_timestamp defined
// but very unlikely because it should only happen with deleted

import { imageSchema } from "../contract";
import { z } from "zod";

// images, which are filtered out. In that event, set date to 0.
export const lenientImageSchema = imageSchema.extend({
  fs_timestamp: z.coerce.date().default(new Date(0)),
});
