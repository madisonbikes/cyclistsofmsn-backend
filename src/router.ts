// router.ts
/**
 * This has the routes defined.
 */
import Router from "koa-router";
import { imageController } from "./controllers/image.controller";
import { postController } from "./controllers/post.controller";
import { jwt } from "./security/jwt";

export const router = new Router();
router.get("/images", async (ctx) => {
  await imageController.getImageList(ctx);
});
router.get("/images/:id", async (ctx) => {
  await imageController.getOneImage(ctx, ctx.params.id);
});

// post operation is secured by jwt token
router.post("/post",
  jwt,
  (ctx, next) => {
    console.log(ctx.state);
    return next();
  },
  async (ctx) => {
    await postController.newPost(ctx);
  }
);
