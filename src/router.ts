// router.ts
/**
 * This has the router
 */
import Router from "koa-router";

const router = new Router();
router.get("/", (ctx) => {
  ctx.body = "Hello World";
});

export default router;
