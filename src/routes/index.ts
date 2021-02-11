// router.ts
/**
 * This has the routes defined.
 */
import Router from "koa-router";
import { router as postRouter } from "./posts";
import { router as imageRouter } from "./images";

export const router = new Router();
router.use(postRouter.routes(), postRouter.allowedMethods());
router.use(imageRouter.routes(), imageRouter.allowedMethods());


