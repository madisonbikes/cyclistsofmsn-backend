// router.ts
/**
 * This has the routes defined.
 */
import { injectable } from "tsyringe";
import express from "express";
import { PostRouter } from "./posts";
import { ImageRouter } from "./images";
import { SessionRouter } from "./session";
import { TasksRouter } from "./tasks";

/** Provide REST API routes for images, posts */
@injectable()
export class MainRouter {
  constructor(
    private imageRouter: ImageRouter,
    private postRouter: PostRouter,
    private sessionRouter: SessionRouter,
    private tasksRouter: TasksRouter
  ) {}

  readonly routes = express
    .Router()
    .use("/posts", this.postRouter.routes)
    .use("/images", this.imageRouter.routes)
    .use("/session", this.sessionRouter.routes)
    .use("/tasks", this.tasksRouter.routes);
}
