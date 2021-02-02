import axios from "axios";
import { configuration } from "./config";
import path from "path";
import { database } from "./database";
import { server } from "./server";

beforeAll(async () => {
  const photos = path.resolve(__dirname, "../test_photos");

  configuration.photos_dir = photos;
  configuration.mongo_uri = "mongodb://localhost:27017/test";

  await database.connect();
  server.start();
});

afterAll(async () => {
  server.stop();
  await database.disconnect();
});

test("hit image list api", async () => {
  const imageResponse = await axios.get("http://localhost:3001/images");
  expect(imageResponse.status).toEqual(200);
  expect(imageResponse.data.length).toEqual(5);
});

test("hit image api", async () => {
  // FIXME how should we get id of image without using API?
  const imageListResponse = await axios.get("http://localhost:3001/images");
  expect(imageListResponse.status).toEqual(200);
  expect(imageListResponse.data.length).toEqual(5);

  const id = imageListResponse.data[0].id;
  const imageResponse = await axios.get(`http://localhost:3001/images/${id}`);
  expect(imageResponse.status).toEqual(200);
  const headers = imageResponse.headers;
  const type = headers["content-type"];
  expect(type).toEqual("image/jpeg");
  expect(imageResponse.data).toBeDefined();
});
