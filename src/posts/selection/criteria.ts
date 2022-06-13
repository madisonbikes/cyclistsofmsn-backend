import { ImageDocument, PostHistory } from "../../database";
import { getDayOfYear, startOfDay, subDays } from "date-fns";
import { injectable } from "tsyringe";
import { NowProvider } from "../../utils";

const MINIMUM_REPOST_INTERVAL_IN_DAYS = 180;
const SEASONALITY_WINDOW = 45;

interface MatchCriteria {
  satisfiedBy(image: ImageDocument): Promise<boolean>;
}

/** returns true if the photo has never been posted */
@injectable()
export class UnpostedCriteria implements MatchCriteria {
  async satisfiedBy(image: ImageDocument): Promise<boolean> {
    const posts = await PostHistory.find().where("image", image);
    return posts.length === 0;
  }
}

@injectable()
export class RepostCriteria implements MatchCriteria {
  constructor(private nowProvider: NowProvider) {}

  async satisfiedBy(image: ImageDocument): Promise<boolean> {
    const threshold = subDays(
      startOfDay(this.nowProvider.now()),
      MINIMUM_REPOST_INTERVAL_IN_DAYS
    );
    const matchingPosts = await PostHistory.find({
      timestamp: { $gte: threshold },
    }).where("image", image);

    return matchingPosts.length === 0;
  }
}

@injectable()
export class SeasonalityCriteria implements MatchCriteria {
  constructor(private nowProvider: NowProvider) {}

  satisfiedBy(image: ImageDocument): Promise<boolean> {
    const createdOnDate = image.exif_createdon;
    if (!createdOnDate) {
      return Promise.resolve(false);
    }

    return Promise.resolve(
      this.dayDifferencesBetweenDates(
        createdOnDate,
        startOfDay(this.nowProvider.now())
      ) <= SEASONALITY_WINDOW
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
