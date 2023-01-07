import dotenv from "dotenv";

let isInit = false;

/** allow for classes to handle init */
export const initEnv = () => {
  if (isInit) return;
  isInit = true;

  const result = dotenv.config();
  if (result.error && process.env.NODE_ENV === "development") {
    console.log(result.error);
  }
};
