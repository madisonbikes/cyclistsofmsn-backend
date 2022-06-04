import { injectable } from "tsyringe";
import { error, ok, RandomProvider, Result, arrayShuffle } from "../../utils";
import { Image, ImageDocument } from "../../database";
import { PostError } from "../scheduler";
import {
  RepostCriteria,
  SeasonalityCriteria,
  UnpostedCriteria,
} from "./criteria";

@injectable()
export class ImageSelector {
  constructor(
    private randomProvider: RandomProvider,
    private repostCriteria: RepostCriteria,
    private seasonalityCriteria: SeasonalityCriteria,
    private unpostedCriteria: UnpostedCriteria
  ) {
    // empty
  }

  public async nextImage(): Promise<Result<ImageDocument, PostError>> {
    const allImages = await Image.find().where({ deleted: false });
    if (allImages.length === 0) {
      return error({ message: "no images" });
    }

    const criteria = [
      // unposted photos that match seasonality
      [this.seasonalityCriteria, this.unpostedCriteria],

      // posted photos outside of repost window (e.g. >180 days) that
      // match seasonality (i.e. last year's photos from this season)
      [this.seasonalityCriteria, this.repostCriteria],

      // any unposted photos left in the repository
      [this.unpostedCriteria],

      // any photos (posted or otherwise) outside of repost window (e.g. >180 days)
      [this.repostCriteria],
    ];

    const orderedPhotoList = arrayShuffle(this.randomProvider, allImages);

    // run through complete repo for each criteria list in order
    for (const activeCriteriaList of criteria) {
      // go through each photo in the list, looking for a criteria match
      for (const candidatePhoto of orderedPhotoList) {
        const values = await Promise.all(
          activeCriteriaList.map((criteria) =>
            criteria.satisfiedBy(candidatePhoto)
          )
        );

        // if any of the criteria were not satisfied, move on to next candidate
        let failed = false;
        for (const value of values) {
          if (!value) {
            failed = true;
            break;
          }
        }
        if (!failed) {
          // hooray!
          return ok(candidatePhoto);
        }
      }
    }

    // last resort, just return the first random photo
    return ok(orderedPhotoList[0]);
  }
}
