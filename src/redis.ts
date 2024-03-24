import { configuration } from "./config";
import RedisStore from "connect-redis";
import { createClient, RedisClientType } from "redis";
import { logger, Lifecycle, maskUriPassword } from "./utils";

export class RedisConnection implements Lifecycle {
  private client?: RedisClientType;

  constructor() {
    if (this.isEnabled()) {
      this.client = createClient({ url: configuration.redisUri });
      this.client.on("error", (err) => logger.warn(err, "Redis Client Error"));
    } else {
      logger.info("Redis disabled");
    }
  }

  isEnabled() {
    return (
      configuration.redisUri !== undefined && configuration.redisUri !== ""
    );
  }

  async start() {
    if (this.client !== undefined) {
      logger.info(
        `Connecting to redis on ${maskUriPassword(configuration.redisUri)}`,
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

export const redis = new RedisConnection();
