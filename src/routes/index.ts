// router.ts
/**
 * This has the routes defined.
 */
import express from "express";
import PostRouter from "./posts";
import ImageRouter from "./images";
import { LoginRoutes } from "./login";
import { injectable } from "tsyringe";

/** Provide REST API routes for images, posts */
@injectable()
class MainRouter {
  constructor(
    private imageRouter: ImageRouter,
    private postRouter: PostRouter,
    private loginRoutes: LoginRoutes
  ) {}

  readonly routes = express
    .Router()
    .use("/posts", this.postRouter.routes)
    .use("/images", this.imageRouter.routes)
    .use(this.loginRoutes.routes);
}

export default MainRouter;
