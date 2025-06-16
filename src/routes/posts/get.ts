import { postHistoryModel } from "../../database";
import { mapPostSchema } from "./types";
import { Request, Response } from "express";
import { logger } from "../../utils";
import { Post, PostList } from "../contract";

const currentPostHandler = async (_req: Request, res: Response) => {
  const post = await postHistoryModel.findLatestPost();
  if (post != null) {
    return res.send(mapPostSchema(post) satisfies Post);
  } else {
    return res.sendStatus(404);
  }
};

const singlePostHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  logger.debug("loading post %s", id);
  const post = await postHistoryModel.findById(id);
  if (post != null) {
    const retval = mapPostSchema(post);
    logger.trace({ post: retval }, "returned post data");
    return res.send(retval satisfies Post);
  } else {
    return res.sendStatus(404);
  }
};

const postListHandler = async (_req: Request, res: Response) => {
  const posts = await postHistoryModel.findOrderedPosts();
  const parsed = posts.map(mapPostSchema);
  logger.trace({ posts: parsed }, "returned posts");
  return res.send(parsed satisfies PostList);
};

export default { currentPostHandler, singlePostHandler, postListHandler };
