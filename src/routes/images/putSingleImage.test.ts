import { setupSuite, testContainer, TestRequest } from "../../test";
import { PhotoServer } from "../../server";
import { Image, User } from "../../database";
import supertest from "supertest";

describe("server process", () => {
  let photoServer: PhotoServer;
  let request: TestRequest;

  setupSuite({ withDatabase: true });

  beforeAll(async () => {
    photoServer = testContainer().resolve(PhotoServer);
    request = supertest.agent(await photoServer.create());

    // create a test user for login
    await User.deleteMany({});

    const testAdmin = new User({
      username: "testadmin",

      // this is a bcrypt of "password"
      hashed_password:
        "$2a$12$T6KY4dGCetX4j9ld.pz6aea8NCk3Ug4aCPfyH2Ng23LaGFB0vVmHW",

      admin: true,
    });
    await testAdmin.save();

    const testUser = new User({
      username: "testuser",

      // this is a bcrypt of "password"
      hashed_password:
        "$2a$12$T6KY4dGCetX4j9ld.pz6aea8NCk3Ug4aCPfyH2Ng23LaGFB0vVmHW",

      admin: false,
    });
    await testUser.save();
  });

  afterAll(async () => {
    await photoServer.stop();
  });

  it("responds to unauthenticated image update api call", () => {
    return request.put(`/api/v1/images/badid`).expect(401);
  });

  it("responds to non-admin image update api call", async () => {
    await request
      .post("/api/v1/login")
      .send({ username: "testuser", password: "password" })
      .expect(200);

    return request.put(`/api/v1/images/badid`).expect(401);
  });

  it("responds to bad id image update api call", async () => {
    await request
      .post("/api/v1/login")
      .send({ username: "testadmin", password: "password" })
      .expect(200);

    return request.put(`/api/v1/images/badid`).expect(404);
  });

  it("responds to missing id image update api call", async () => {
    await request
      .post("/api/v1/login")
      .send({ username: "testadmin", password: "password" })
      .expect(200);

    return request
      .put(`/api/v1/images/000000000000000000000000`)
      .send({ description: "blarg" })
      .expect(404);
  });

  it("responds to image update api call", async () => {
    await request
      .post("/api/v1/login")
      .send({ username: "testadmin", password: "password" })
      .expect(200);

    const goodImageId = await getGoodImageId();

    await request
      .put(`/api/v1/images/${goodImageId}`)
      .send({ description: "blarg" })
      .expect(200);

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
