// router.ts
/**
 * This has the routes defined.
 */
import KoaRouter from "koa-router";
import { PostRouter } from "./posts";
import { ImageRouter } from "./images";
import { injectable } from "tsyringe";

@injectable()
export class Router extends KoaRouter {
  constructor(imageRouter: ImageRouter, postRouter: PostRouter) {
    super();

    this.use(postRouter.routes(), postRouter.allowedMethods());
    this.use(imageRouter.routes(), imageRouter.allowedMethods());
  }
}


