import { configuration } from "./config";
import RedisStore from "connect-redis";
import { createClient, RedisClientType } from "redis";
import { logger, Lifecycle, maskUriPassword } from "./utils";

class RedisConnection implements Lifecycle {
  private client?: RedisClientType;
  private started = false;

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
    if (this.started) {
      throw new Error("cannot start multiple redis connection instances");
    }
    this.started = true;
    if (this.client !== undefined) {
      logger.info(
        `Connecting to redis on ${maskUriPassword(configuration.redisUri)}`,
      );
      await this.client.connect();
    }
  }

  async stop() {
    if (!this.started) {
      throw new Error("cannot stop a redis connection that isn't started");
    }
    this.started = false;
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
