import KoaRouter from "koa-router";
import { PostHistory, PostHistoryDocument, Image } from "../../database";
import assert from "assert";
import { jwt } from "../../security/jwt";
import { injectable } from "tsyringe";

@injectable()
export class PostRouter extends KoaRouter {
  constructor() {
    super({ prefix: "/posts" });

    this.get("/", async (ctx) => {
        ctx.set("Cache-Control", "max-age=60, s-max-age=3600");
        const posts = await PostHistory.findOrderedPosts();
        ctx.body = posts.map(mapPost);
      }
    );

    this.get("/current", async (ctx) => {
      const post = await PostHistory.findCurrentPost();
      if (post) {
        ctx.body = mapPost(post);
      }
    });

    // post operation is secured by jwt token
    this.post("/create",
      jwt(["create:post"]),
      async (ctx) => {
        ctx.body = "Submitted new post";
      }
    );
  }
}

function mapPost(post: PostHistoryDocument) {
  assert(post.image instanceof Image);
  return { id: post._id, timestamp: post.timestamp, image: post.image._id };
}
