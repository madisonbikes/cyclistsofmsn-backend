import axios from "axios";
import config from "./env";
import path from "path";
const photos = path.resolve(__dirname, "../test_photos");
config.photos_dir = photos;

import server from "./server";

afterAll(() => {
  server.close();
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
