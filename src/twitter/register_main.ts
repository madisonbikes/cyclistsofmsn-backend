import { TwitterRegisterConfiguration } from "./register";

/** launches twitter_register */
Promise.resolve()
  .then(() => {
    const main = new TwitterRegisterConfiguration();
    return main.run();
  })
  .catch((error: unknown) => {
    console.error(error);
  });
