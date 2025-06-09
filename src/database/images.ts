import { Collection, ObjectId } from "mongodb";
import { DbImage, dbImageSchema } from "./types";
import { logger } from "../utils";

export type ImageModelCollectionType = Collection<Omit<DbImage, "_id">>;

type FilterProps = {
  filterDeleted?: boolean;
  filterHidden?: boolean;
};

export type ImageId = string | ObjectId;

export class ImageModel {
  constructor(private collection: ImageModelCollectionType) {}

  findById(id: ImageId, filter?: FilterProps) {
    const objectId = new ObjectId(id);
    return this.collection.findOne({
      _id: objectId,
      ...this.buildFilterArgs(filter),
    });
  }

  findByFilename(filename: string) {
    return this.collection.findOne({
      filename,
    });
  }

  async findAll(filter?: FilterProps) {
    const images = await this.collection
      .find(this.buildFilterArgs(filter))
      .toArray();
    logger.trace(images, "findAllImages");
    return images;
  }

  findByIdAndDelete(id: ImageId) {
    const objectId = new ObjectId(id);
    return this.collection.findOneAndDelete({ _id: objectId });
  }

  async insertOne(data: Partial<DbImage>): Promise<DbImage> {
    const insertedData = dbImageSchema.omit({ _id: true }).strict().parse(data);
    const inserted = await this.collection.insertOne(insertedData);
    logger.trace(
      insertedData,
      "Inserted image with id %s",
      inserted.insertedId,
    );
    return { _id: inserted.insertedId, ...insertedData };
  }

  /** returns old document */
  updateOne(id: ImageId, data: Partial<Omit<DbImage, "_id">>) {
    logger.trace(data, "Updating image with id %s", id);
    return this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: data },
    );
  }

  private buildFilterArgs(filter?: FilterProps) {
    const args: Record<string, boolean> = {};
    if (filter?.filterDeleted ?? false) {
      args.deleted = false;
    }
    if (filter?.filterHidden ?? false) {
      args.hidden = false;
    }
    return args;
  }
}
