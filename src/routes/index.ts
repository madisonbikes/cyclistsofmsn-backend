/**
 * This has the routes defined.
 */
import express from "express";
import postRouter from "./posts/index.ts";
import imageRouter from "./images/index.ts";
import sessionRouter from "./session.ts";
import tasksRouter from "./tasks.ts";
import infoRouter from "./info.ts";
import cron from "./cron.ts";

/** Provide REST API routes for images, posts */
function routes() {
  return express
    .Router()
    .use("/info", infoRouter.routes())
    .use("/posts", postRouter.routes())
    .use("/images", imageRouter.routes())
    .use("/session", sessionRouter.routes())
    .use("/tasks", tasksRouter.routes())
    .use("/cron", cron.routes());
}

export default { routes };
