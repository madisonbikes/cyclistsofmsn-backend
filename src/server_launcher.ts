import { server } from "./server";

/** launches server. this syntax allows server startup to run as async function */
Promise.resolve()
  .then(() => {
    return server.start();
  })
  .catch((error) => {
    console.error(error);
  });
