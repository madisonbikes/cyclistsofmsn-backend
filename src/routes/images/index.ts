import express from "express";
import {
  validateBodySchema,
  validateQuerySchema,
  validateAuthenticated,
  Roles,
  validateRole,
  validateId,
  validateAdmin,
} from "../../security/index.js";
import imageGet from "./get.js";
import singleImageDelete from "./delete.js";
import imagePut from "./put.js";

function routes() {
  return (
    express
      .Router()

      // all images
      .get("/", validateAuthenticated(), imageGet.listHandler)

      .put(
        "/:id",
        validateBodySchema({ schema: imagePut.bodySchema }),
        validateRole({ role: Roles.EDITOR }),
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
