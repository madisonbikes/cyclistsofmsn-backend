import axios from "axios";
import { expect } from "chai";
import { startServer } from "./server";

let close: () => Promise<void> | undefined;

describe("server process", function() {
  before(async function () {
    this.timeout(15000);
    close = await startServer();
  });

  after(async () => {
    await close();
  });

  it("responds to image list api call", async function() {
    const imageResponse = await axios.get("/images");
    expect(imageResponse.status).eq(200);
    expect(imageResponse.data.length).eq(5);
  });

  it("response to single image api call", async function() {
    const imageListResponse = await axios.get("/images");
    expect(imageListResponse.status).eq(200);
    expect(imageListResponse.data.length).eq(5);

    const id = imageListResponse.data[0].id;
    const imageResponse = await axios.get(`images/${id}`);
    expect(imageResponse.status).eq(200);
    const headers = imageResponse.headers;
    const type = headers["content-type"];
    expect(type).eq("image/jpeg");
    expect(imageResponse.data).to.exist;
  });
});