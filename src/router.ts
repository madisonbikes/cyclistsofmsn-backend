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

router.get("/posts",
  async (ctx) => {
    await postController.postList(ctx);
  }
);

router.get("/posts/current", async (ctx) => {
  await postController.getCurrentPost(ctx);
});

// post operation is secured by jwt token
router.post("/posts/create",
  jwt(["create:post"]),
  async (ctx) => {
    await postController.newPost(ctx);
  }
);
