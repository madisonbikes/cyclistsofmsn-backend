import { database, postHistoryModel } from "../../database";
import { getDayOfYear, startOfDay, subDays } from "date-fns";
import now from "../../utils/now";
import { DbImage } from "../../database/types";

const MINIMUM_REPOST_INTERVAL_IN_DAYS = 180;
const SEASONALITY_WINDOW = 45;

interface MatchCriteria {
  satisfiedBy(image: DbImage): Promise<boolean>;
}

/** returns true if the photo has never been posted */
export class UnpostedCriteria implements MatchCriteria {
  async satisfiedBy(image: DbImage) {
    const posts = await postHistoryModel.findByImage(image._id);
    return posts.length === 0;
  }
}

export class RepostCriteria implements MatchCriteria {
  async satisfiedBy(image: DbImage) {
    const threshold = subDays(
      startOfDay(now()),
      MINIMUM_REPOST_INTERVAL_IN_DAYS,
    );
    const matchingPosts = await database.posts
      .find({
        timestamp: { $gte: threshold },
        image: image._id,
      })
      .toArray();

    return matchingPosts.length === 0;
  }
}

export class SeasonalityCriteria implements MatchCriteria {
  satisfiedBy(image: DbImage) {
    const createdOnDate = image.exif_createdon;
    if (!createdOnDate) {
      return Promise.resolve(false);
    }

    return Promise.resolve(
      this.dayDifferencesBetweenDates(createdOnDate, startOfDay(now())) <=
        SEASONALITY_WINDOW,
    );
  }

  private dayDifferencesBetweenDates(d1: Date, d2: Date) {
    const dd1 = getDayOfYear(d1);
    const dd2 = getDayOfYear(d2);
    const v1 = Math.abs(dd1 - dd2);
    const v2 = Math.abs(dd1 + 366 - dd2);
    return Math.min(v1, v2);
  }
}
