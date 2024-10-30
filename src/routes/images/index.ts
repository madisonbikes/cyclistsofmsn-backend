import express from "express";
import {
  validateBodySchema,
  validateQuerySchema,
  validateAuthenticated,
  Roles,
  validateRole,
  validateId,
  validateAdmin,
} from "../../security";
import imageGet from "./get";
import singleImageDelete from "./delete";
import cache from "../cache";
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
        validateRole({ role: Roles.EDITOR }),
        validateId(),
        imagePut.handler,
      )

      // single image metadata
      .get("/:id", validateId(), imageGet.metadata)

      .delete("/:id", validateAdmin(), validateId(), singleImageDelete.handler)

      // single image, cached
      .get(
        "/:id/binary",
        cache.middleware({ callNextWhenCacheable: false }),
        validateId(),
        validateQuerySchema({ schema: imageGet.querySchema }),
        imageGet.binary,
      )
  );
}

export default { routes };
