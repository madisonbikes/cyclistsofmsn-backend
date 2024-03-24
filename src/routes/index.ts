// router.ts
/**
 * This has the routes defined.
 */
import express from "express";
import { PostRouter } from "./posts";
import { ImageRouter } from "./images";
import { SessionRouter } from "./session";
import { TasksRouter } from "./tasks";

/** Provide REST API routes for images, posts */
export class MainRouter {
  private readonly imageRouter = new ImageRouter();
  private readonly postRouter = new PostRouter();
  private readonly sessionRouter = new SessionRouter();
  private readonly tasksRouter = new TasksRouter();

  routes = () => {
    return express
      .Router()
      .use("/posts", this.postRouter.routes())
      .use("/images", this.imageRouter.routes())
      .use("/session", this.sessionRouter.routes())
      .use("/tasks", this.tasksRouter.routes());
  };
}
