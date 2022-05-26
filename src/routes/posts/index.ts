import KoaRouter from "koa-router";
import { PostHistory, PostHistoryDocument } from "../../database";
import { jwt } from "../../security/jwt";
import { injectable } from "tsyringe";
import { isDocument } from "@typegoose/typegoose";

@injectable()
export class PostRouter extends KoaRouter {
  constructor() {
    super({ prefix: "/posts" });

    this

      // all posts
      .get("/", async (ctx) => {
        ctx.set("Cache-Control", "max-age=60, s-max-age=3600");
        const posts = await PostHistory.findOrderedPosts();
        ctx.body = posts.map(mapPost);
      })

      // current post
      .get("/current", async (ctx) => {
        const post = await PostHistory.findCurrentPost();
        if (post) {
          ctx.body = mapPost(post);
        }
      })

      // post create operation is secured by jwt token
      .post("/create", jwt(["create:post"]), async (ctx) => {
        ctx.body = "Submitted new post";
      });
  }
}

function mapPost(post: PostHistoryDocument) {
  if (isDocument(post.image)) {
    return { id: post.id, timestamp: post.timestamp, image: post.image._id };
  } else {
    return { id: post.id, timestamp: post.timestamp, image: post.image };
  }
}
