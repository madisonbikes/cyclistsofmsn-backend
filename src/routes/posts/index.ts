import express from "express";
import { injectable } from "tsyringe";
import { asyncWrapper } from "../async";
import {
  Roles,
  validateAdmin,
  validateAuthenticated,
  validateBodySchema,
  validateId,
  validateRole,
} from "../../security";
import {
  bodySchema as singlePostPutSchema,
  handler as singlePostPutHandler,
} from "./put";
import { handler as singlePostDeleteHandler } from "./delete";
import { currentPostHandler, getPostHandler, getPostListHandler } from "./get";

@injectable()
export class PostRouter {
  readonly routes = express
    .Router()

    // all posts
    .get("/", asyncWrapper(getPostListHandler))

    // current post
    .get("/current", asyncWrapper(currentPostHandler))

    // specific post
    .get(
      "/:id",
      validateAuthenticated(),
      validateId(),
      asyncWrapper(getPostHandler)
    )

    .put(
      "/:id",
      validateBodySchema({ schema: singlePostPutSchema }),
      validateEditor(),
      validateId(),
      asyncWrapper(singlePostPutHandler)
    )

    .delete(
      "/:id",
      validateAdmin(),
      validateId(),
      asyncWrapper(singlePostDeleteHandler)
    )

    // post create operation is secured by editor role
    .post("/create", validateEditor(), (_req, res) => {
      return res.send("Submitted new post");
    });
}

const validateEditor = () => {
  return validateRole({ role: Roles.EDITOR });
};
