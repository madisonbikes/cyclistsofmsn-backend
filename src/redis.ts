import { injectable, singleton } from "tsyringe";
import { ServerConfiguration } from "./config";
import RedisStore from "connect-redis";
import { createClient, RedisClientType } from "redis";
import { logger, Lifecycle, maskUriPassword } from "./utils";

@injectable()
@singleton()
export class RedisConnection implements Lifecycle {
  private client?: RedisClientType;

  constructor(private config: ServerConfiguration) {
    if (this.isEnabled()) {
      this.client = createClient({ url: config.redisUri });
      this.client.on("error", (err) => logger.warn(err, "Redis Client Error"));
    } else {
      logger.info("Redis disabled");
    }
  }

  isEnabled() {
    return this.config.redisUri !== undefined && this.config.redisUri !== "";
  }

  async start() {
    if (this.client !== undefined) {
      logger.info(
        `Connecting to redis on ${maskUriPassword(this.config.redisUri)}`
      );
      await this.client.connect();
    }
  }

  async stop() {
    if (this.client !== undefined) {
      await this.client.disconnect();
      this.client = undefined;
    }
  }

  createStore() {
    return new RedisStore({ client: this.client });
  }
}
