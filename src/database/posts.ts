import { Collection, ObjectId } from "mongodb";
import { endOfDay, startOfDay } from "date-fns";
import {
  dbPopulatedPostHistorySchema,
  DbPostHistory,
  dbPostHistorySchema,
  DbPostHistoryStatus,
} from "./types";
import { ImageId } from "./images";

export type PostHistoryModelCollectionType = Collection<
  Omit<DbPostHistory, "_id">
>;

type PostId = string | ObjectId;

export class PostHistoryModel {
  constructor(private collection: PostHistoryModelCollectionType) {}
  async findLatestPost() {
    const value = await this.collection
      .find({ "status.flag": "complete" })
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();
    if (value.length === 0) {
      return null;
    }
    return value[0];
  }

  async findById(postId: PostId) {
    const post = await this.collection.findOne({
      _id: new ObjectId(postId),
    });
    return post;
  }

  async findByImage(imageId: ImageId) {
    const posts = await this.collection
      .find({ image: new ObjectId(imageId) })
      .toArray();
    return dbPostHistorySchema.array().parse(posts);
  }

  async clearImageRefs(imageId: ImageId) {
    return await this.collection.updateMany(
      { image: new ObjectId(imageId) },
      { $unset: { image: "" } },
    );
  }

  async findOrderedPosts() {
    const posts = await this.collection
      .aggregate([
        { $sort: { timestamp: -1 } },
        // populate the populatedImage field with the image document
        {
          $lookup: {
            from: "images",
            localField: "image",
            foreignField: "_id",
            as: "populatedImage",
          },
        },
        // convert the populatedImage array to a single object
        {
          $unwind: {
            path: "$populatedImage",
            preserveNullAndEmptyArrays: true,
          },
        },
      ])
      .toArray();

    const typedPosts = dbPopulatedPostHistorySchema.array().parse(posts);

    return typedPosts.flatMap((post) => {
      if (post.populatedImage?.deleted === true) {
        post.image = undefined;
        post.populatedImage = undefined;
      }
      return post;
    });
  }

  async findScheduledPost(when: Date) {
    const start = startOfDay(when);
    const end = endOfDay(when);
    const posts = await this.collection
      .aggregate([
        {
          $match: {
            "status.flag": { $eq: "pending" },
            timestamp: { $gte: start, $lte: end },
          },
        },
        { $sort: { timestamp: -1 } },
        // populate the populatedImage field with the image document
        {
          $lookup: {
            from: "images",
            localField: "image",
            foreignField: "_id",
            as: "populatedImage",
          },
        },
        // convert the populatedImage array to a single object
        {
          $unwind: {
            path: "$populatedImage",
            preserveNullAndEmptyArrays: true,
          },
        },
      ])
      .toArray();

    const typedPosts = dbPopulatedPostHistorySchema.array().parse(posts);

    return typedPosts.flatMap((post) => {
      if (post.populatedImage?.deleted === true) {
        post.image = undefined;
        post.populatedImage = undefined;
      }
      return post;
    });
  }

  updatePostStatus(postId: PostId, status: DbPostHistoryStatus) {
    return this.collection.updateOne(
      { _id: new ObjectId(postId) },
      { $set: { status } },
    );
  }

  async insertOne(data: Partial<DbPostHistory>): Promise<DbPostHistory> {
    const insertedData = dbPostHistorySchema
      .omit({ _id: true })
      .strict()
      .parse(data);
    const insertedRecord = await this.collection.insertOne(insertedData);
    return { _id: insertedRecord.insertedId, ...insertedData };
  }

  /** returns old document */
  updateOne(id: PostId, data: Partial<Omit<DbPostHistory, "_id">>) {
    return this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: data },
    );
  }

  deleteOne(id: PostId) {
    return this.collection.deleteOne({ _id: new ObjectId(id) });
  }
}
