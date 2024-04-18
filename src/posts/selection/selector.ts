import { error, ok, Result, arrayShuffle } from "../../utils";
import { Image, ImageDocument } from "../../database";
import { PostError } from "../postScheduler";
import {
  RepostCriteria,
  SeasonalityCriteria,
  UnpostedCriteria,
} from "./criteria";
const repostCriteria = new RepostCriteria();
const seasonalityCriteria = new SeasonalityCriteria();
const unpostedCriteria = new UnpostedCriteria();

async function nextImage(): Promise<Result<ImageDocument, PostError>> {
  const allImages = await Image.find({
    deleted: false,
    hidden: false,
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
