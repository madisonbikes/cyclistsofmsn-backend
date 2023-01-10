import { z } from "zod";

const optionalNumberSchema = z.preprocess((arg) => {
  if (arg === undefined) {
    return undefined;
  } else {
    return parseInt(arg as string);
  }
}, z.number().optional());

export const GetImageQuerySchema = z.object({
  width: optionalNumberSchema,
  height: optionalNumberSchema,
});
