import {
  loginTestAdminUser,
  loginTestEditorUser,
  loginTestUser,
  setupSuite,
  testRequest,
  TestRequest,
} from "../../test";
import { Image } from "../../database";
import {
  createTestAdminUser,
  createTestEditorUser,
  createTestUser,
} from "../../test/data";

describe("server process - images", () => {
  let request: TestRequest;

  setupSuite({ withDatabase: true, withPhotoServer: true });

  beforeAll(async () => {
    await Promise.all([
      createTestUser(),
      createTestAdminUser(),
      createTestEditorUser(),
    ]);
  });

  beforeEach(() => {
    request = testRequest();
  });

  it("responds to unauthenticated image update api call", () => {
    return request.put(`/api/v1/images/badid`).expect(401);
  });

  it("responds to non-editor image update api call", async () => {
    await loginTestUser(request);
    return request.put(`/api/v1/images/badid`).expect(401);
  });

  it("responds to bad id image update api call", async () => {
    await loginTestAdminUser(request);
    return request.put(`/api/v1/images/badid`).expect(404);
  });

  it("responds to missing id image update api call", async () => {
    await loginTestAdminUser(request);

    return request
      .put(`/api/v1/images/000000000000000000000000`)
      .send({ description: "blarg" })
      .expect(404);
  });

  it("responds to image update api call", async () => {
    await loginTestEditorUser(request);
    const goodImageId = await getGoodImageId();

    await request
      .put(`/api/v1/images/${goodImageId}`)
      .send({ description: "blarg" })
      .expect(200)
      .expect(/blarg/);

    const checkImage = await Image.findById(goodImageId);
    expect(checkImage).toBeDefined();
    expect(checkImage?.description).toEqual("blarg");
    expect(checkImage?.description_from_exif).toEqual(false);
  });

  const getGoodImageId = async () => {
    const retval = (
      await Image.findOne({
        filename: "test_DSC_7020.jpg",
      })
    )?._id;
    expect(retval).toBeDefined();
    return retval;
  };
});