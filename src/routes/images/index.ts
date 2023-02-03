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
import { SingleImageGet } from "./get";
import { SingleImageDelete } from "./delete";
import { handler as imageListHandler } from "./imageList";
import { Cache } from "../cache";
import {
  handler as singleImagePutHandler,
  bodySchema as singleImagePutSchema,
} from "./put";

@injectable()
export class ImageRouter {
  constructor(
    private cache: Cache,
    private singleGet: SingleImageGet,
    private singleDelete: SingleImageDelete
  ) {}

  readonly routes = express
    .Router()

    // all images
    .get("/", validateAuthenticated(), asyncWrapper(imageListHandler))

    .put(
      "/:id",
      validateBodySchema({ schema: singleImagePutSchema }),
      validateRole({ role: Roles.EDITOR }),
      validateId(),
      asyncWrapper(singleImagePutHandler)
    )

    // single image metadata
    .get("/:id", validateId(), asyncWrapper(this.singleGet.metadata))

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
      validateQuerySchema({ schema: this.singleGet.querySchema }),
      asyncWrapper(this.singleGet.binary)
    );
}
