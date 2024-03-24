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
import { asyncWrapper } from "../async";
import imageGet from "./get";
import singleImageDelete from "./delete";
import cache from "../cache";
import imagePut from "./put";

class ImageRouter {
  routes = () => {
    return (
      express
        .Router()

        // all images
        .get("/", validateAuthenticated(), asyncWrapper(imageGet.listHandler))

        .put(
          "/:id",
          validateBodySchema({ schema: imagePut.bodySchema }),
          validateRole({ role: Roles.EDITOR }),
          validateId(),
          asyncWrapper(imagePut.handler),
        )

        // single image metadata
        .get("/:id", validateId(), asyncWrapper(imageGet.metadata))

        .delete(
          "/:id",
          validateAdmin(),
          validateId(),
          asyncWrapper(singleImageDelete.handler),
        )

        // single image, cached
        .get(
          "/:id/binary",
          cache.middleware({ callNextWhenCacheable: false }),
          validateId(),
          validateQuerySchema({ schema: imageGet.querySchema }),
          asyncWrapper(imageGet.binary),
        )
    );
  };
}

export default new ImageRouter();
