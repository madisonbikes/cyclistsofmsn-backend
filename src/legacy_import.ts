/**
 * Standalone import tool for old posts from the old log file.
 * This can be removed once old site is out of production.
 */
import "reflect-metadata";
import rl from "readline";
import fs from "fs";
import path from "path";
import parse from "date-fns/parse";

import { Database, Image, PostHistory, PostStatus } from "./database";
import { logger } from "./utils";
import { container, injectable } from "tsyringe";
import { once } from "events";

/** expose command-line launcher */
if (require.main === module) {
  if (process.argv.length !== 3) {
    console.error("supply logfile as only argument");
    process.exit(1);
  }
  void Promise.resolve()
    .then(() => {
      const importer = container.resolve(Importer);
      return importer.perform_import(process.argv[2]);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .then(() => {
      return process.exit(0);
    });
}

type Post = { filename: string; date: Date };

/** import post history from cyclists_of_msn logfile */
@injectable()
export class Importer {
  constructor(private database: Database) {}

  async perform_import(logFile: string): Promise<number> {
    logger.info({ logFile }, `importing log`);
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
    await once(readInterface, "close");

    await this.database.start();

    let count = 0,
      placeholders = 0,
      runningDeletedCount = 0;
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

      const { deletedCount } = await PostHistory.deleteMany({
        image: image.id,
        timestamp: p.date,
      });
      runningDeletedCount += deletedCount ?? 0;

      const newDoc = new PostHistory();
      newDoc.image = image;
      newDoc.timestamp = p.date;
      newDoc.status.flag = PostStatus.COMPLETE;
      newDoc.status.uri = "twitter";
      await newDoc.save();

      count++;
    }
    logger.info(
      `Imported ${count} posts, added ${placeholders} placeholder images, deleted ${runningDeletedCount} existing matching entries.`
    );

    // and we're done
    await this.database.stop();
    return count;
  }
}
