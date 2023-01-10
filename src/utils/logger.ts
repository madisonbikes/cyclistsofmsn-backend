import pino, { Logger } from "pino";
import { initEnv } from "./env";

initEnv();

const logFile = process.env.LOG_FILE || "backend.log";
const logLevel = process.env.LOG_LEVEL || "info";
const consoleLogLevel = process.env.CONSOLE_LOG_LEVEL || "info";
const testLogLevel = process.env.TEST_LOG_LEVEL || "silent";

let newLogger: Logger;
if (process.env.NODE_ENV === "test") {
  newLogger = pino({ level: testLogLevel });
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

  // ensure pino base logger level is set to minimum of the two transports
  const minLevel = Math.min(
    pino.levels.values[consoleLogLevel],
    pino.levels.values[logLevel]
  );
  const minLevelAsString = pino.levels.labels[minLevel];
  console.log(minLevelAsString);
  newLogger = pino({ level: minLevelAsString }, transport);
}
export const logger = newLogger;
