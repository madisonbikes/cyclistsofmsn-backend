// router.ts
/**
 * This has the routes defined.
 */
import Router from "koa-router";
import { imageController } from "./controllers/image.controller";

export const router = new Router();
router.get("/images", async (ctx) => {
  await imageController.getImageList(ctx);
});
router.get("/images/:id", async (ctx) => {
  imageController.getOneImage(ctx, ctx.params.id);
});
