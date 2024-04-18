import { logger, safeAsyncWrapper } from "../utils";
import now from "../utils/now";
import { add as date_add, startOfDay } from "date-fns";
import { Cancellable, scheduleRepeat } from "../utils/simple_scheduler";
import { schedulePost } from "./postScheduler";
import imageRepositoryScanner from "../scan";

/** future-populate very 6 hours */
const POPULATE_INTERVAL = 6 * 60 * 60 * 1000;
const POPULATE_DELAY = 30 * 1000;

const POPULATE_COUNT = 7;

/**
 * The post populate class schedules posts a week in advance and runs every six hours or so.
 */
const scheduled: Array<Cancellable | undefined> = [];

function start(): void {
  scheduled.push(
    scheduleRepeat(
      safeAsyncWrapper("populate", asyncPopulate),
      POPULATE_INTERVAL,
      POPULATE_DELAY,
    ),
  );
}

function stop(): void {
  scheduled.forEach((v, ndx, array) => {
    v?.cancel();
    array[ndx] = undefined;
  });
}

const asyncPopulate = async () => {
  logger.info("Scanning for new images");
  await imageRepositoryScanner.scan();

  logger.info(`Populating ${POPULATE_COUNT} days of posts`);

  const start = startOfDay(now());
  for (let i = 0; i < POPULATE_COUNT; i++) {
    const when = date_add(start, { days: i });
    await schedulePost({
      when,
      selectImage: true,
    });
  }
};

export default { start, stop };
