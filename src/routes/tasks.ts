import express from "express";
import { injectable } from "tsyringe";
import { PostScheduler } from "../posts/scheduler";
import { validateAdmin, validateBodySchema } from "../security";
import { asyncWrapper } from "./async";
import { SchedulePostOptions, schedulePostOptionsSchema } from "./contract";
import { mapPostSchema } from "./posts/types";

@injectable()
export class TasksRouter {
  constructor(private scheduler: PostScheduler) {}

  readonly routes = express.Router().post(
    "/schedulePost",
    validateAdmin(),
    validateBodySchema({ schema: schedulePostOptionsSchema }),
    asyncWrapper(async (request, response) => {
      const postOptions = request.validated as SchedulePostOptions;
      const result = await this.scheduler.schedulePost(postOptions);
      if (result.isOk()) {
        const mapped = mapPostSchema.parse(result.value);
        response.status(200).send(mapped);
      } else {
        response.status(400).send(result.value);
      }
    })
  );
}
