import express from "express";
import { injectable } from "tsyringe";
import {
  validateBodySchema,
  validateQuerySchema,
} from "../../security/validateSchema";
import { asyncWrapper } from "../async";
import { GetSingleImageHandler } from "./getSingleImage";
import imageListHandler from "./imageList";
import Cache from "../cache";
import validateAdmin from "../../security/validateAdmin";
import { PutSingleImageHandler } from "./putSingleImage";

@injectable()
class ImageRouter {
  constructor(
    private cache: Cache,
    private getSingleImageHandler: GetSingleImageHandler,
    private putSingleImageHandler: PutSingleImageHandler
  ) {}

  readonly routes = express
    .Router()

    // all images
    .get("/", asyncWrapper(imageListHandler))

    .put(
      "/:id",
      validateBodySchema(this.putSingleImageHandler.schema),
      validateAdmin,
      asyncWrapper(this.putSingleImageHandler.handler)
    )

    // single image, cached
    .get(
      "/:id",
      this.cache.middleware({ callNextWhenCacheable: false }),
      validateQuerySchema(this.getSingleImageHandler.schema),
      asyncWrapper(this.getSingleImageHandler.handler)
    );
}

export default ImageRouter;
