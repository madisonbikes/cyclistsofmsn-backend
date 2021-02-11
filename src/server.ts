import Koa from "koa";
import logger from "koa-logger";
import serve from "koa-static";
import { router } from "./routes";
import { configuration } from "./config";
import { Server } from "http";
import { scan } from "./scan";
import { database } from "./database";

class ApiServer {
  private server?: Server;

  async start() {
    await database.connect()
    await scan()

    const app = new Koa();
    app.use(logger());

    // in production mode, serve the production React app from here
    if (configuration.react_static_root_dir) {
      app.use(serve(configuration.react_static_root_dir));
    }
    app.use(router.routes());
    app.use(router.allowedMethods());

    this.server = app.listen(configuration.server_port, () => {
      console.log(`Server is listening on port ${configuration.server_port}`);
    });
  }

  stop() {
    if(this.server) {
      this.server.close()
    }
  }
}

export const server = new ApiServer()