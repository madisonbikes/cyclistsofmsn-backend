// router.ts
/**
 * This has the routes defined.
 */
import Router from "koa-router";
import { ImageController } from "./controllers/image.controller";

const router = new Router();
router.get("/images", ImageController.getImageList);
router.get("/images/:id", (ctx) => {
  ImageController.getOneImage(ctx, ctx.params.id);
});

export default router;
