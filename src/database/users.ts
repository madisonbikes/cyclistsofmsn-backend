import { Collection } from "mongodb";
import { type DbUser } from "./types.ts";

export type UserModelCollectionType = Collection<Omit<DbUser, "_id">>;
/**
 * Holds users, typically admin but allows for others.
 */
export class UserModel {
  private readonly collection: UserModelCollectionType;

  constructor(collection: UserModelCollectionType) {
    this.collection = collection;
  }
  async findByUsername(username: string) {
    return await this.collection.findOne({ username });
  }
}
