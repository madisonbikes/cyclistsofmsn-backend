// router.ts
/**
 * This has the routes defined.
 */
import PostRouter from "./posts";
import ImageRouter from "./images";
import { injectable } from "tsyringe";
import Router from "koa__router";

@injectable()
class MainRouter extends Router {
  constructor(imageRouter: ImageRouter, postRouter: PostRouter) {
    super();

    this.use(postRouter.routes(), postRouter.allowedMethods()).use(
      imageRouter.routes(),
      imageRouter.allowedMethods()
    );
  }
}

export default MainRouter;
