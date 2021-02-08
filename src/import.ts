import rl from "readline";
import fs from "fs";
import path from "path";
import parse from "date-fns/parse";

import { database } from "./database";
import { Image } from "./schema/images.model";
import { PostHistory } from "./schema/post_history.model";

/** import post history from cyclists_of_msn logfile */
Promise.resolve()
  .then(() => {
    return perform_import();
  }).catch((error) => {
  console.error(error);
});

type Post = { filename: string, date: Date }

async function perform_import() {
  if (process.argv.length != 3) {
    console.error("supply logfile as only argument");
    process.exit(1);
  }
  const logFile = process.argv[2];
  console.info(`importing ${logFile}`);
  const readInterface = rl.createInterface(fs.createReadStream(logFile));
  const posts: Post[] = [];
  readInterface.on("line", (data) => {
    const matched = data.match(/^posting\s+(.*)\s+at\s+\w+\s+(.*)\s+UTC\s+(.*)\.\.\./);
    if (matched) {
      const filename = path.basename(matched[1]);
      // strip out UTC portion
      const date = matched[2] + " " + matched[3] + " Z";
      const parsedDate = parse(date, "MMM d HH:mm:ss yyyy X", new Date());

      posts.push({ filename: filename, date: parsedDate });
    }
  });

  await database.connect();

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
    await PostHistory.deleteMany({ image_id: image.id, timestamp: p.date });

    const newDoc = new PostHistory();
    newDoc.image_id = image.id;
    newDoc.timestamp = p.date;
    newDoc.destination = { target: "twitter_legacy" };
    await newDoc.save();

    count++;
  }
  console.info(`Imported ${count} posts, added ${placeholders} placeholder images.`);

  // and we're done
  await database.disconnect();
  /*
  // sample query to get list of posts
  const results = await PostHistory.aggregate([
    { $group: { _id: `$image_id`, count: { $sum: 1 } } },
    { $sort: { count: 1 } }
  ]);
  console.log(JSON.stringify(results));
   */
  process.exit();
}