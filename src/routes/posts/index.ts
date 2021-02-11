import Router from "koa-router";
import { PostHistory } from "../../database/post_history.model";
import { PostHistoryDocument } from "../../database/post_history.types";
import { Image } from "../../database/images.model";
import assert from "assert";
import { jwt } from "../../security/jwt";

export const router = new Router({ prefix: "/posts" });

router.get("/", async (ctx) => {
    ctx.set("Cache-Control", "max-age=60, s-max-age=3600");
    const posts = await PostHistory.findOrderedPosts();
    ctx.body = posts.map(mapPost);
  }
);

router.get("/current", async (ctx) => {
  const post = await PostHistory.findCurrentPost();
  if (post) {
    ctx.body = mapPost(post);
  }
});

// post operation is secured by jwt token
router.post("/create",
  jwt(["create:post"]),
  async (ctx) => {
    ctx.body = "Submitted new post";
  }
);

function mapPost(post: PostHistoryDocument) {
  assert(post.image instanceof Image);
  return { id: post._id, timestamp: post.timestamp, image: post.image._id };
}
