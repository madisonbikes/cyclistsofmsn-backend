/**
 * This has the routes defined.
 */
import express from "express";
import postRouter from "./posts/index.js";
import imageRouter from "./images/index.js";
import sessionRouter from "./session.js";
import tasksRouter from "./tasks.js";
import infoRouter from "./info.js";
import cron from "./cron.js";

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
