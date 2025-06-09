import { logger } from "../utils";
import now from "../utils/now";
import { add as date_add, startOfDay } from "date-fns";
import { schedulePost } from "./postScheduler";
import imageRepositoryScanner from "../scan";

/** future-populate every 6 hours */
//const POPULATE_INTERVAL = 6 * 60 * 60 * 1000;
const POPULATE_COUNT = 7;

/**
 * The post populate class schedules posts a week in advance and should be run every six hours or so.
 */

export const populatePostsOnSchedule = async () => {
  logger.info("Scanning for new images");
  await imageRepositoryScanner.scan();

  logger.info(`Populating %d days of posts`, POPULATE_COUNT);

  const start = startOfDay(now());
  for (let i = 0; i < POPULATE_COUNT; i++) {
    const when = date_add(start, { days: i });
    await schedulePost({
      when,
      selectImage: true,
    });
  }
};
