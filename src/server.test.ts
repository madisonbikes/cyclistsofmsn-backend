import axios from "axios";
import { database } from "./database";
import { startServer } from "./server";
import { Server } from "http";

let testServer: Server | undefined;

beforeAll(async () => {
  testServer = await startServer();
});

afterAll(async () => {
  testServer?.close();

  await database.disconnect();
});

test("hit image list api", async () => {
  const imageResponse = await axios.get("/images");
  expect(imageResponse.status).toEqual(200);
  expect(imageResponse.data.length).toEqual(5);
});

test("hit image api", async () => {
  // FIXME how should we get id of image without using API?
  const imageListResponse = await axios.get("/images");
  expect(imageListResponse.status).toEqual(200);
  expect(imageListResponse.data.length).toEqual(5);

  const id = imageListResponse.data[0].id;
  const imageResponse = await axios.get(`images/${id}`);
  expect(imageResponse.status).toEqual(200);
  const headers = imageResponse.headers;
  const type = headers["content-type"];
  expect(type).toEqual("image/jpeg");
  expect(imageResponse.data).toBeDefined();
});