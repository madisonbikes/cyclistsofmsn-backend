import { randomInt as actualRandomInt } from "crypto";

export const randomInt = (min: number, max: number): number => {
  return actualRandomInt(min, max);
};
