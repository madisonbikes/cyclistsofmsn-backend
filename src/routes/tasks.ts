import express from "express";
import { schedulePost } from "../posts/postScheduler";
import { validateAdmin, validateBodySchema } from "../security";
import { asyncWrapper } from "./async";
import { SchedulePostOptions, schedulePostOptionsSchema } from "./contract";
import { mapPostSchema } from "./posts/types";

class TasksRouter {
  routes = () => {
    return express.Router().post(
      "/schedulePost",
      validateAdmin(),
      validateBodySchema({ schema: schedulePostOptionsSchema }),
      asyncWrapper(async (request, response) => {
        const postOptions = request.validated as SchedulePostOptions;
        const result = await schedulePost(postOptions);
        if (result.isOk()) {
          const mapped = mapPostSchema.parse(result.value);
          response.send(mapped);
        } else {
          response.status(400).send(result.value);
        }
      }),
    );
  };
}

export default new TasksRouter();
