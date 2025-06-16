import { imageModel } from "../../database/database.ts";
import type { DbImage } from "../../database/types.ts";
import { error, ok, type Result, arrayShuffle } from "../../utils/index.ts";
import {
  RepostCriteria,
  SeasonalityCriteria,
  UnpostedCriteria,
} from "./criteria.ts";

const repostCriteria = new RepostCriteria();
const seasonalityCriteria = new SeasonalityCriteria();
const unpostedCriteria = new UnpostedCriteria();

interface ImageSelectionError {
  message: string;
  critical?: boolean;
}

async function nextImage(): Promise<Result<DbImage, ImageSelectionError>> {
  const allImages = await imageModel.findAll({
    filterDeleted: true,
    filterHidden: true,
  });
  if (allImages.length === 0) {
    return error({ message: "no images", critical: true });
  }

  const criteria = [
    // unposted photos that match seasonality
    [seasonalityCriteria, unpostedCriteria],

    // posted photos outside of repost window (e.g. >180 days) that
    // match seasonality (i.e. last year's photos from this season)
    [seasonalityCriteria, repostCriteria],

    // any unposted photos left in the repository
    [unpostedCriteria],

    // any photos (posted or otherwise) outside of repost window (e.g. >180 days)
    [repostCriteria],
  ];

  const orderedPhotoList = arrayShuffle(allImages);

  // run through complete repo for each criteria list in order
  for (const activeCriteriaList of criteria) {
    // go through each photo in the list, looking for a criteria match
    for (const candidatePhoto of orderedPhotoList) {
      const values = await Promise.all(
        activeCriteriaList.map((criteria) =>
          criteria.satisfiedBy(candidatePhoto),
        ),
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

export default { nextImage };
