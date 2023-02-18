import { injectable } from "tsyringe";
import { ServerConfiguration } from "./config";
import connectRedis from "connect-redis";
import { createClient, RedisClientType } from "redis";
import { logger, Lifecycle } from "./utils";
import session from "express-session";

@injectable()
export class RedisConnection implements Lifecycle {
  private client?: RedisClientType;

  constructor(private config: ServerConfiguration) {
    if (this.isEnabled()) {
      this.client = createClient({ legacyMode: true, url: config.redisUri });
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
      logger.info(`Connecting to redis on ${this.config.redisUri}`);
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
    const rs = connectRedis(session);
    return new rs({ client: this.client });
  }
}
