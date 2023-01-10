import pino, { Logger, TransportTargetOptions } from "pino";
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
  const targets: TransportTargetOptions[] = [
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
  ];
  const transport = pino.transport({
    targets,
  });

  // ensure pino base logger level is set to minimum of the transports
  const levels = targets.map((t) => t.level).map((l) => pino.levels.values[l]);
  const minLevel = Math.min(...levels);
  const minLevelAsString = pino.levels.labels[minLevel];
  newLogger = pino({ level: minLevelAsString }, transport);
}
export const logger = newLogger;
