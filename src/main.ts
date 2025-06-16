import { PhotoServer } from "./server.ts";
import { logger } from "./utils/logger.ts";

logger.trace("Starting Cyclists of Madison Backend...");
console.log("Starting Cyclists of Madison Backend...");
/** launches server */
try {
  const server = new PhotoServer();
  console.log("2");
  void server.start();
} catch (error: unknown) {
  logger.error(error);
}
