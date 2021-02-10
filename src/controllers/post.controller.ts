import { Context } from "koa";
import { PostHistory } from "../schema/post_history.model";
import { PostHistoryDocument } from "../schema/post_history.types";

class PostController {
  public async newPost(ctx: Context) {
    ctx.body = "Submitted new post";
  }

  public async postList(ctx: Context) {
    ctx.set("Cache-Control", "max-age=60, s-max-age=3600");
    const posts = await PostHistory.find().sort({ timestamp: "asc" });
    ctx.body = posts.map(this.mapPost);
  }

  public async getCurrentPost(ctx: Context) {
    const post = await PostHistory.findOne().sort({ timestamp: "-1" });
    if(post) {
      ctx.body = this.mapPost(post);
    }
  }

  mapPost(post: PostHistoryDocument) {
    return { id: post.id, timestamp: post.timestamp, image_id: post.image_id };
  }
}

export const postController = new PostController();