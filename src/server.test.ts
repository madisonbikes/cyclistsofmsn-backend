import { PhotoServer } from "./server";
import axios from "axios";
import { expect } from "chai";
import { container } from "./test/setup";

describe("server process", function () {
  let photoServer: PhotoServer | undefined;

  beforeEach(function () {
    container.clearInstances()
  })

  before(async function () {
    photoServer = container.resolve(PhotoServer);
    await photoServer.start();
  });

  after(async function () {
    await photoServer?.stop();
    photoServer = undefined;
  });

  it("responds to image list api call", async function () {
    const imageResponse = await axios.get("/images");
    expect(imageResponse.status).eq(200);
    expect(imageResponse.data.length).eq(5);
  });

  it("response to single image api call", async function () {
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
