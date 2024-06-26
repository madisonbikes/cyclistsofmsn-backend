import { PostHistory } from "../../database";
import { mapPostSchema } from "./types";
import { Request, Response } from "express";
import { logger } from "../../utils";

const currentPostHandler = async (_req: Request, res: Response) => {
  const post = await PostHistory.findLatestPost();
  if (post != null) {
    return res.send(mapPostSchema.parse(post));
  } else {
    return res.sendStatus(404);
  }
};

const singlePostHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  logger.debug(`loading post ${id}`);
  const post = await PostHistory.findById(id);
  if (post != null) {
    const retval = mapPostSchema.parse(post);
    logger.trace({ post: retval }, "returned post data");
    return res.send(retval);
  } else {
    return res.sendStatus(404);
  }
};

const postListHandler = async (_req: Request, res: Response) => {
  const posts = await PostHistory.findOrderedPosts();
  const parsed = mapPostSchema.array().parse(posts);
  logger.trace({ posts: parsed }, "returned posts");
  return res.send(parsed);
};

export default { currentPostHandler, singlePostHandler, postListHandler };
