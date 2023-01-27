import express from "express";
import { injectable } from "tsyringe";
import {
  validateBodySchema,
  validateQuerySchema,
  validateAuthenticated,
  Roles,
  validateRole,
} from "../../security";
import { asyncWrapper } from "../async";
import { GetSingleImageHandler } from "./getSingleImage";
import { handler as imageListHandler } from "./imageList";
import { Cache } from "../cache";
import { PutSingleImageHandler } from "./putSingleImage";

@injectable()
export class ImageRouter {
  constructor(
    private cache: Cache,
    private getSingleImageHandler: GetSingleImageHandler,
    private putSingleImageHandler: PutSingleImageHandler
  ) {}

  readonly routes = express
    .Router()

    // all images
    .get("/", validateAuthenticated(), asyncWrapper(imageListHandler))

    .put(
      "/:id",
      validateBodySchema({ schema: this.putSingleImageHandler.schema }),
      validateRole({ role: Roles.EDITOR }),
      asyncWrapper(this.putSingleImageHandler.handler)
    )

    // single image metadata
    .get("/:id", asyncWrapper(this.getSingleImageHandler.metadata))

    // single image, cached
    .get(
      "/:id/binary",
      this.cache.middleware({ callNextWhenCacheable: false }),
      validateQuerySchema({ schema: this.getSingleImageHandler.schema }),
      asyncWrapper(this.getSingleImageHandler.binary)
    );
}
