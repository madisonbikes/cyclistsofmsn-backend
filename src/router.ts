// router.ts
/**
 * This has the routes defined.
 */
import Router from "koa-router";
import { imageController } from "./controllers/image.controller";

export const router = new Router();
router.get("/images", imageController.getImageList);
router.get("/images/:id", (ctx) => {
  imageController.getOneImage(ctx, ctx.params.id);
});
