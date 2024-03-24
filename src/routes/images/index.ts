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
import { ImageGet } from "./get";
import { SingleImageDelete } from "./delete";
import cache from "../cache";
import { ImagePut, bodySchema as singleImagePutSchema } from "./put";

export class ImageRouter {
  private readonly imageGet = new ImageGet();
  private readonly singleDelete = new SingleImageDelete();
  private readonly imagePut = new ImagePut();

  routes = () => {
    return (
      express
        .Router()

        // all images
        .get(
          "/",
          validateAuthenticated(),
          asyncWrapper(this.imageGet.listHandler),
        )

        .put(
          "/:id",
          validateBodySchema({ schema: singleImagePutSchema }),
          validateRole({ role: Roles.EDITOR }),
          validateId(),
          asyncWrapper(this.imagePut.handler),
        )

        // single image metadata
        .get("/:id", validateId(), asyncWrapper(this.imageGet.metadata))

        .delete(
          "/:id",
          validateAdmin(),
          validateId(),
          asyncWrapper(this.singleDelete.handler),
        )

        // single image, cached
        .get(
          "/:id/binary",
          cache.middleware({ callNextWhenCacheable: false }),
          validateId(),
          validateQuerySchema({ schema: this.imageGet.querySchema }),
          asyncWrapper(this.imageGet.binary),
        )
    );
  };
}
