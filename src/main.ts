import { PhotoServer } from "./server";
import { logger } from "./utils/logger";

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
