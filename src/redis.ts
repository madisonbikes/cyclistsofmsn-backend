import { configuration } from "./config";
import RedisStore from "connect-redis";
import { createClient, RedisClientType } from "redis";
import { logger, Lifecycle, maskUriPassword } from "./utils";

class RedisConnection implements Lifecycle {
  private client?: RedisClientType;
  private started = false;

  get isEnabled() {
    return (
      configuration.redisUri !== undefined && configuration.redisUri !== ""
    );
  }

  async start() {
    if (this.started) {
      throw new Error("cannot start multiple redis connection instances");
    }
    this.started = true;
    if (!this.isEnabled) {
      logger.info("Redis disabled");
      return;
    }

    this.client = createClient({ url: configuration.redisUri });
    this.client.on("error", (err) => logger.warn(err, "Redis Client Error"));
    logger.info(
      `Connecting to redis on ${maskUriPassword(configuration.redisUri)}`,
    );
    await this.client.connect();
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
    if (!this.client) {
      throw new Error("Redis connection not started");
    }
    return new RedisStore({ client: this.client });
  }
}

// singleton hack because we don't have good DI
export const redis = new RedisConnection();
