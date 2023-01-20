import express from "express";
import { PostHistory, PostHistoryDocument } from "../../database";
import { injectable } from "tsyringe";
import { isDocument } from "@typegoose/typegoose";
import { localMiddleware } from "../../security/authentication";
import validateAdmin from "../../security/validateAdmin";
import { logger } from "../../utils";

@injectable()
class PostRouter {
  readonly routes = express
    .Router()

    // all posts
    .get("/", async (req, res) => {
      res.set("Cache-Control", "max-age=60, s-max-age=3600");
      const posts = await PostHistory.findOrderedPosts();
      logger.debug({ posts }, "returned posts");
      return res.send(posts.map(mapPost));
    })

    // current post
    .get("/current", async (req, res) => {
      const post = await PostHistory.findCurrentPost();
      if (post) {
        return res.send(mapPost(post));
      } else {
        return res.sendStatus(404);
      }
    })

    // post create operation is secured by admin
    .post("/create", localMiddleware, validateAdmin, (_req, res) => {
      return res.send("Submitted new post");
    });
}

const mapPost = (post: PostHistoryDocument) => {
  if (isDocument(post.image)) {
    return { id: post.id, timestamp: post.timestamp, image: post.image._id };
  } else {
    return { id: post.id, timestamp: post.timestamp, image: post.image };
  }
};

export default PostRouter;
