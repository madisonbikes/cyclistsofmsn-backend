import pino, { Logger } from "pino";
import { initEnv } from "./env";

initEnv();

const logFile = process.env.LOG_FILE || "backend.log";
const logLevel = process.env.LOG_LEVEL || "info";
const consoleLogLevel = process.env.CONSOLE_LOG_LEVEL || "info";

let newLogger: Logger;
if (process.env.NODE_ENV === "test") {
  newLogger = pino({ level: "silent" });
} else {
  const transport = pino.transport({
    targets: [
      {
        level: consoleLogLevel,
        target: "pino-pretty",
        options: { destination: 1 }, // stdout
      },
      {
        level: logLevel,
        target: "pino-pretty",
        options: { colorize: false, destination: logFile },
      },
    ],
  });
  newLogger = pino(transport);
}
export const logger = newLogger;
