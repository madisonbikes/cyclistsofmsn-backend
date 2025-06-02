import { type ImageDocument, PostHistory } from "../../database/index.js";
import { getDayOfYear, startOfDay, subDays } from "date-fns";
import now from "../../utils/now.js";

const MINIMUM_REPOST_INTERVAL_IN_DAYS = 180;
const SEASONALITY_WINDOW = 45;

interface MatchCriteria {
  satisfiedBy(image: ImageDocument): Promise<boolean>;
}

/** returns true if the photo has never been posted */
export class UnpostedCriteria implements MatchCriteria {
  async satisfiedBy(image: ImageDocument) {
    const posts = await PostHistory.find().where("image", image);
    return posts.length === 0;
  }
}

export class RepostCriteria implements MatchCriteria {
  async satisfiedBy(image: ImageDocument) {
    const threshold = subDays(
      startOfDay(now()),
      MINIMUM_REPOST_INTERVAL_IN_DAYS,
    );
    const matchingPosts = await PostHistory.find({
      timestamp: { $gte: threshold },
    }).where("image", image);

    return matchingPosts.length === 0;
  }
}

export class SeasonalityCriteria implements MatchCriteria {
  satisfiedBy(image: ImageDocument) {
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
