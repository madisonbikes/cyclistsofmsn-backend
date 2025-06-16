import express from "express";
import {
  validateAdmin,
  validateAuthenticated,
  validateBodySchema,
  validateId,
  validateRole,
} from "../../security";
import singlePostPut from "./put";
import singlePostDelete from "./delete";
import postGet from "./get";

function validateEditor() {
  return validateRole({ role: "editor" });
}

function routes() {
  return (
    express
      .Router()

      // all posts
      .get("/", postGet.postListHandler)

      // current post
      .get("/current", postGet.currentPostHandler)

      // specific post
      .get(
        "/:id",
        validateAuthenticated(),
        validateId(),
        postGet.singlePostHandler,
      )

      .put(
        "/:id",
        validateBodySchema({ schema: singlePostPut.bodySchema }),
        validateEditor(),
        validateId(),
        singlePostPut.handler,
      )

      .delete("/:id", validateAdmin(), validateId(), singlePostDelete.handler)

      // post create operation is secured by editor role
      .post("/create", validateEditor(), (_req, res) => {
        return res.send("Submitted new post");
      })
  );
}

export default { routes };
