import express from "express";
import { injectable } from "tsyringe";
import { validateQuerySchema } from "../../security/validateSchema";
import { asyncWrapper } from "../async";
import { SingleImageHandler } from "./singleImage";
import { handler } from "./imageList";
import Cache from "../cache";

@injectable()
class ImageRouter {
  constructor(
    private cache: Cache,
    private singleImageHandler: SingleImageHandler
  ) {}

  readonly routes = express
    .Router()
    // all images
    .get("/", asyncWrapper(handler))

    // single image, cached
    .get(
      "/:id",
      this.cache.middleware({ callNextWhenCacheable: false }),
      validateQuerySchema(this.singleImageHandler.schema),
      asyncWrapper(this.singleImageHandler.handler)
    );
}

export default ImageRouter;
