import axios from "axios";
import { startServer } from "./server";

let close: () => Promise<void> | undefined;

beforeAll(async () => {
  close = await startServer();
});

afterAll(async () => {
  await close()
});

describe("server process", () => {

  it("responds to image list api call", async () => {
    const imageResponse = await axios.get("/images");
    expect(imageResponse.status).toEqual(200);
    expect(imageResponse.data.length).toEqual(5);
  });

  it("response to single image api call", async () => {
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
});