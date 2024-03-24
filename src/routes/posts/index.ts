import express from "express";
import { asyncWrapper } from "../async";
import {
  Roles,
  validateAdmin,
  validateAuthenticated,
  validateBodySchema,
  validateId,
  validateRole,
} from "../../security";
import singlePostPut from "./put";
import singlePostDelete from "./delete";
import postGet from "./get";

class PostRouter {
  routes = () => {
    return (
      express
        .Router()

        // all posts
        .get("/", asyncWrapper(postGet.postListHandler))

        // current post
        .get("/current", asyncWrapper(postGet.currentPostHandler))

        // specific post
        .get(
          "/:id",
          validateAuthenticated(),
          validateId(),
          asyncWrapper(postGet.singlePostHandler),
        )

        .put(
          "/:id",
          validateBodySchema({ schema: singlePostPut.bodySchema }),
          validateEditor(),
          validateId(),
          asyncWrapper(singlePostPut.handler),
        )

        .delete(
          "/:id",
          validateAdmin(),
          validateId(),
          asyncWrapper(singlePostDelete.handler),
        )

        // post create operation is secured by editor role
        .post("/create", validateEditor(), (_req, res) => {
          return res.send("Submitted new post");
        })
    );
  };
}

const validateEditor = () => {
  return validateRole({ role: Roles.EDITOR });
};

export default new PostRouter();
