// router.ts
/**
 * This has the routes defined.
 */
import express from "express";
import PostRouter from "./posts";
import ImageRouter from "./images";
import { injectable } from "tsyringe";

@injectable()
class MainRouter {
  constructor(
    private imageRouter: ImageRouter,
    private postRouter: PostRouter
  ) {}

  readonly routes = express
    .Router()
    .use("/posts", this.postRouter.routes)
    .use("/images", this.imageRouter.routes);
}

export default MainRouter;
