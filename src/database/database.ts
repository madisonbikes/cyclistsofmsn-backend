import { configuration } from "../config";
import { logger, maskUriPassword } from "../utils";
import { ImageModel, ImageModelCollectionType } from "./images";
import { PostHistoryModel, PostHistoryModelCollectionType } from "./posts";
import { UserModel, UserModelCollectionType } from "./users";
import { VersionModelCollectionType, VersionsModel } from "./version";
import { Db, MongoClient, ObjectId } from "mongodb";

/** provide unified access to database connection */

let imageModel: ImageModel;
let postHistoryModel: PostHistoryModel;
let userModel: UserModel;

class Database {
  private _images!: ImageModelCollectionType;
  private _posts!: PostHistoryModelCollectionType;
  private _users!: UserModelCollectionType;
  private _versions!: VersionModelCollectionType;

  /** set to true if db version change should force a rescan of all existing files */
  private _refreshAllMetadata = false;

  private client: MongoClient | undefined;

  get refreshAllMetadata() {
    return this._refreshAllMetadata;
  }

  private database: Db | undefined;

  public get images() {
    return this._images;
  }

  public get posts() {
    return this._posts;
  }

  public get users() {
    return this._users;
  }

  public get versions() {
    return this._versions;
  }

  async start(): Promise<boolean> {
    const uri = configuration.mongodbUri;
    if (this.client) {
      logger.debug({ url: uri }, `Already connected to MongoDB`);
      return false;
    }
    logger.info("Connecting to MongoDB on %s", maskUriPassword(uri));

    // set ignoreUndefined to true to avoid sending undefined values to MongoDB
    // which would otherwise result in an error when using strict schema validation using our
    // zod schemas
    this.client = new MongoClient(uri);
    this.database = this.client.db();

    this._images = this.database.collection("images");
    await this._images.createIndex({ filename: 1 });

    this._posts = this.database.collection("posts");
    await this._posts.createIndex({ timestamp: 1 });

    this._users = this.database.collection("users");
    await this._users.createIndex({ username: 1 }, { unique: true });

    this._versions = this.database.collection("schema_version");
    await this._versions.createIndex({ version: 1 }, { unique: true });

    const versionsModel = new VersionsModel(this._versions, this._images);
    const { needsMetadataRefresh } = await versionsModel.versionCheck();
    this._refreshAllMetadata = needsMetadataRefresh;

    imageModel = new ImageModel(this._images);
    postHistoryModel = new PostHistoryModel(this._posts);
    userModel = new UserModel(this._users);

    return true;
  }

  async stop(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = undefined;
      this.database = undefined;
    }
  }

  triggerMetadataRefresh() {
    if (!this.refreshAllMetadata) {
      logger.info("Forcing refresh of all metadata due to database upgrade");
      this._refreshAllMetadata = true;
    }
  }
}

export function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id);
}

export const database = new Database();
export { imageModel, postHistoryModel, userModel };
