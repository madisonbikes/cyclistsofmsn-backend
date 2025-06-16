import express from "express";
import { schedulePost } from "../posts/postScheduler.ts";
import { validateAdmin, validateBodySchema } from "../security/index.ts";
import {
  type SchedulePostOptions,
  schedulePostOptionsSchema,
} from "./contract/index.ts";
import { mapPostSchema } from "./posts/types.ts";

function routes() {
  return express
    .Router()
    .post(
      "/schedulePost",
      validateAdmin(),
      validateBodySchema({ schema: schedulePostOptionsSchema }),
      async (request, response) => {
        const postOptions = request.validated as SchedulePostOptions;
        const result = await schedulePost(postOptions);
        if (result.isOk()) {
          const mapped = mapPostSchema(result.value);
          response.send(mapped);
        } else {
          response.status(400).send(result.value);
        }
      },
    );
}

export default { routes };
