import Koa from "koa";
import logger from "koa-logger";
import serve from "koa-static";
import { router } from "./router";
import config from "./env";

const app = new Koa();
app.use(logger());

// in production mode, serve the production React app from here
if (config.react_static_root_dir) {
  app.use(serve(config.react_static_root_dir));
}
app.use(router.routes());
app.use(router.allowedMethods());

const server = app.listen(config.server_port, () => {
  console.log(`Server is listening on port ${config.server_port}`);
});
export default server;
