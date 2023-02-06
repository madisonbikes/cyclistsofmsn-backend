import express from "express";
import { injectable } from "tsyringe";
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
import { Cache } from "../cache";
import {
  handler as singleImagePutHandler,
  bodySchema as singleImagePutSchema,
} from "./put";

@injectable()
export class ImageRouter {
  constructor(
    private cache: Cache,
    private imageGet: ImageGet,
    private singleDelete: SingleImageDelete
  ) {}

  readonly routes = express
    .Router()

    // all images
    .get("/", validateAuthenticated(), asyncWrapper(this.imageGet.listHandler))

    .put(
      "/:id",
      validateBodySchema({ schema: singleImagePutSchema }),
      validateRole({ role: Roles.EDITOR }),
      validateId(),
      asyncWrapper(singleImagePutHandler)
    )

    // single image metadata
    .get("/:id", validateId(), asyncWrapper(this.imageGet.metadata))

    .delete(
      "/:id",
      validateAdmin(),
      validateId(),
      asyncWrapper(this.singleDelete.handler)
    )

    // single image, cached
    .get(
      "/:id/binary",
      this.cache.middleware({ callNextWhenCacheable: false }),
      validateId(),
      validateQuerySchema({ schema: this.imageGet.querySchema }),
      asyncWrapper(this.imageGet.binary)
    );
}
