import { database, imageModel } from "../database/index.ts";
import { expect } from "vitest";

/** returns array of inserted post id's */
export const createTestPosts = async () => {
  const { insertedId: image } = await database.images.insertOne({
    filename: "blarg.jpg",
    deleted: false,
    description_from_exif: false,
    hidden: false,
  });
  const { insertedIds, insertedCount } = await database.posts.insertMany([
    {
      image,
      timestamp: new Date(Date.now() + 2000),
      status: { flag: "failed" },
    },
    {
      image,
      timestamp: new Date(Date.now()),
      status: { flag: "complete" },
    },
    {
      image,
      timestamp: new Date(Date.now() + 1000),
      status: { flag: "pending" },
    },
    // add post missing image id to test filtering
    {
      timestamp: new Date(Date.now() + 3000),
      status: { flag: "pending" },
    },
  ]);

  const mappedPostIds: string[] = [];
  for (let i = 0; i < insertedCount; i++) {
    mappedPostIds.push(insertedIds[i].toString());
  }
  return { insertedImageId: image.toString(), insertedPostIds: mappedPostIds };
};

const PASSWORD_WITH_LOW_WORK_FACTOR =
  "$2y$04$lQNknVpHEe6ddO3Et1nMGe6q4lNrtNcC3ikrhshs.wT.neD7JwBbm";

export const createTestUser = async () => {
  await database.users.insertOne({
    username: "testuser",
    hashed_password: PASSWORD_WITH_LOW_WORK_FACTOR,
    roles: [],
  });
};

export const createTestAdminUser = async () => {
  await database.users.insertOne({
    username: "testadmin",
    hashed_password: PASSWORD_WITH_LOW_WORK_FACTOR,
    roles: ["admin", "editor"],
  });
};

export const createTestEditorUser = async () => {
  await database.users.insertOne({
    username: "testeditor",
    hashed_password: PASSWORD_WITH_LOW_WORK_FACTOR,
    roles: ["editor"],
  });
};

export const getGoodImageId = async () => {
  const retval = (await imageModel.findByFilename("test_DSC_7020.jpg"))?._id;
  expect(retval).toBeDefined();
  if (retval == null) {
    throw new Error("No good image id found");
  }
  return retval;
};
