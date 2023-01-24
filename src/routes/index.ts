// router.ts
/**
 * This has the routes defined.
 */
import express from "express";
import { PostRouter } from "./posts";
import { ImageRouter } from "./images";
import { SecurityRoutes } from "./security";
import { injectable } from "tsyringe";

/** Provide REST API routes for images, posts */
@injectable()
export class MainRouter {
  constructor(
    private imageRouter: ImageRouter,
    private postRouter: PostRouter,
    private securityRoutes: SecurityRoutes
  ) {}

  readonly routes = express
    .Router()
    .use("/posts", this.postRouter.routes)
    .use("/images", this.imageRouter.routes)
    .use(this.securityRoutes.routes);
}
