/**
 * Standalone import tool for old posts from the old log file.
 * This can be removed once old site is out of production.
 */
import "reflect-metadata";
import rl from "readline";
import fs from "fs";
import path from "path";
import parse from "date-fns/parse";

import { Image } from "./database/images.model";
import { PostHistory } from "./database/post_history.model";
import { PostStatus } from "./database/post_history.types";
import { logger } from "./utils/logger";
import { injectable, container } from "tsyringe";
import { Database } from "./database";

/** expose command-line launcher */
if (require.main === module) {
  if (process.argv.length != 3) {
    console.error("supply logfile as only argument");
    process.exit(1);
  }
  Promise.resolve()
    .then(() => {
      const importer = container.resolve(Importer);
      importer.perform_import(process.argv[2]);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .then(() => {
      process.exit(0);
    });
}

type Post = { filename: string; date: Date };

/** import post history from cyclists_of_msn logfile */
@injectable()
export class Importer {
  constructor(private database: Database) {}

  async perform_import(logFile: string): Promise<number> {
    logger.info(`importing ${logFile}`);
    const readInterface = rl.createInterface(fs.createReadStream(logFile));
    const posts: Post[] = [];
    readInterface.on("line", (data) => {
      const matched = data.match(
        /^posting\s+(.*)\s+at\s+\w+\s+(.*)\s+UTC\s+(.*)\.\.\./
      );
      if (matched) {
        const filename = path.basename(matched[1]);
        // strip out UTC portion
        const date = matched[2] + " " + matched[3] + " Z";
        const parsedDate = parse(date, "MMM d HH:mm:ss yyyy X", new Date());

        posts.push({ filename: filename, date: parsedDate });
      }
    });

    await this.database.connect();

    let count = 0;
    let placeholders = 0;
    for await (const p of posts) {
      let image = await Image.findOne({ filename: p.filename });
      if (!image) {
        // create a deleted, placeholder image
        const newImage = new Image();
        newImage.filename = p.filename;
        newImage.deleted = true;
        image = await newImage.save();
        placeholders++;
      }
      // delete any existing posts that match this exactly
      await PostHistory.deleteMany({ image: image.id, timestamp: p.date });

      const newDoc = new PostHistory();
      newDoc.image = image._id;
      newDoc.timestamp = p.date;
      newDoc.status.flag = PostStatus.COMPLETE;
      newDoc.status.uri = "twitter";
      await newDoc.save();

      count++;
    }
    logger.info(
      `Imported ${count} posts, added ${placeholders} placeholder images.`
    );

    // and we're done
    await this.database.disconnect();
    /*
  // sample query to get list of posts
  const results = await PostHistory.aggregate([
    { $group: { _id: `$image`, count: { $sum: 1 } } },
    { $sort: { count: 1 } }
  ]);
  console.log(JSON.stringify(results));
   */
    return count;
  }
}
