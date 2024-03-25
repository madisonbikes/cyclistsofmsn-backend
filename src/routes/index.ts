/**
 * This has the routes defined.
 */
import express from "express";
import postRouter from "./posts";
import imageRouter from "./images";
import sessionRouter from "./session";
import tasksRouter from "./tasks";

/** Provide REST API routes for images, posts */
function routes() {
  return express
    .Router()
    .use("/posts", postRouter.routes())
    .use("/images", imageRouter.routes())
    .use("/session", sessionRouter.routes())
    .use("/tasks", tasksRouter.routes());
}

export default { routes };
