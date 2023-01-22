import express, { Request, Response } from "express";
import { PostHistory } from "../../database";
import { injectable } from "tsyringe";
import { logger } from "../../utils";
import { mapPostSchema } from "./types";
import { asyncWrapper } from "../async";
import validateAdmin from "../../security/validateAdmin";
import validateAuthenticated from "../../security/validateAuthenticated";

@injectable()
class PostRouter {
  readonly routes = express
    .Router()

    // all posts
    .get("/", validateAuthenticated, asyncWrapper(loadPostList))

    // current post
    .get("/current", asyncWrapper(loadCurrentPost))

    // post create operation is secured by admin
    .post("/create", validateAdmin, (_req, res) => {
      return res.send("Submitted new post");
    });
}

const loadPostList = async (_req: Request, res: Response) => {
  const posts = await PostHistory.findOrderedPosts();
  logger.debug({ posts }, "returned posts");
  return res.send(mapPostSchema.array().parse(posts));
};

const loadCurrentPost = async (_req: Request, res: Response) => {
  const post = await PostHistory.findCurrentPost();
  if (post) {
    return res.send(mapPostSchema.parse(post));
  } else {
    return res.sendStatus(404);
  }
};

export default PostRouter;
