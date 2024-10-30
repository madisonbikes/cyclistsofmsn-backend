import express from "express";
import { asyncWrapper } from "./async";
import { dispatchPostOnSchedule } from "../posts/dispatcher";
import { populatePostsOnSchedule } from "../posts/populate";

function routes() {
  return (
    express
      .Router()
      // */5 * * * * curl -X POST http://localhost:3000/ap1/v1/cron/schedulePost
      .post(
        "/schedulePost",
        asyncWrapper(async (_, response) => {
          await dispatchPostOnSchedule();
          response.status(204);
        }),
      )
      // 5 */6 * * * curl -X POST http://localhost:3000/ap1/v1/cron/populatePosts
      .post(
        "/populatePosts",
        asyncWrapper(async (_, response) => {
          await populatePostsOnSchedule();
          response.status(204);
        }),
      )
  );
}

export default { routes };
