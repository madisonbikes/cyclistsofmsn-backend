import { Context } from "koa";

class PostController {
  public async newPost(ctx: Context) {
    ctx.body = "Submitted new post"
  }
}

export const postController = new PostController()