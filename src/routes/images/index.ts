import express from "express";
import {
  validateBodySchema,
  validateQuerySchema,
  validateAuthenticated,
  validateRole,
  validateId,
  validateAdmin,
} from "../../security/index.ts";
import imageGet from "./get.ts";
import singleImageDelete from "./delete.ts";
import imagePut from "./put.ts";

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
