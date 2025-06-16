import { Collection } from "mongodb";
import { type DbUser } from "./types.js";

export type UserModelCollectionType = Collection<Omit<DbUser, "_id">>;
/**
 * Holds users, typically admin but allows for others.
 */
export class UserModel {
  constructor(private readonly collection: UserModelCollectionType) {}
  async findByUsername(username: string) {
    return await this.collection.findOne({ username });
  }
}
