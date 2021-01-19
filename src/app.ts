import Koa from "koa";
import logger from "koa-logger";
import { router } from "./router";
import { doConnect } from "./connection";
import { Image } from "./entity/Image";

doConnect().then(async (connection) => {
  const newImage = new Image();
  newImage.path = "blarg";
  connection.getRepository(Image).insert(newImage);
  const app = new Koa();
  app.use(logger());
  app.use(router.routes());
  app.use(router.allowedMethods());
  app.listen(3000);
});
