import { Context } from "koa";
import { PostHistory } from "../schema/post_history.model";
import { PostHistoryDocument } from "../schema/post_history.types";
import { Image } from "../schema/images.model";
import assert from "assert";

class PostController {
  public async newPost(ctx: Context) {
    ctx.body = "Submitted new post";
  }

  public async postList(ctx: Context) {
    ctx.set("Cache-Control", "max-age=60, s-max-age=3600");
    const posts = await PostHistory.find()
      .sort({ timestamp: "1" })
      .populate("image", "deleted");

    ctx.body = posts
      .filter((post) => {
        assert(post.image instanceof Image);
        return !post.image.deleted;
      })
      .map(this.mapPost);
  }

  public async getCurrentPost(ctx: Context) {
    const post = await PostHistory.findOne()
      .sort({ timestamp: "-1" })
      .populate("image", "deleted");

    if (post) {
      ctx.body = this.mapPost(post);
    }
  }

  mapPost(post: PostHistoryDocument) {
    assert(post.image instanceof Image);
    return { id: post._id, timestamp: post.timestamp, image: post.image._id };
  }
}

export const postController = new PostController();