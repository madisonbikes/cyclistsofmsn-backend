import express from "express";
import {
  validateBodySchema,
  validateQuerySchema,
  validateAuthenticated,
  validateRole,
  validateId,
  validateAdmin,
} from "../../security";
import imageGet from "./get";
import singleImageDelete from "./delete";
import imagePut from "./put";

function routes() {
  return (
    express
      .Router()

      // all images
      .get("/", validateAuthenticated(), imageGet.listHandler)

      .put(
        "/:id",
        validateBodySchema({ schema: imagePut.bodySchema }),
        validateRole({ role: "editor" }),
        validateId(),
        imagePut.handler,
      )

      // single image metadata
      .get("/:id", validateId(), imageGet.metadata)

      .delete("/:id", validateAdmin(), validateId(), singleImageDelete.handler)

      // single image
      .get(
        "/:id/binary",
        validateId(),
        validateQuerySchema({ schema: imageGet.querySchema }),
        imageGet.binary,
      )
  );
}

export default { routes };
