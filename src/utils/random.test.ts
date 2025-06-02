import { randomInt } from "./random.js";

jest.mock("./random");

// structure: min, max, randomInt result
const cases = [
  [5, 45, 44],
  [45, 55, 50],
  [55, 90, 55],
];

describe("exercise the mock implementation of randomInt", () => {
  test.each(cases)(
    "given %p and %p as arguments to randomInt, returns %p",
    (firstArg, secondArg, expectedResult) => {
      const result = randomInt(firstArg, secondArg);
      expect(result).toEqual(expectedResult);
    },
  );
});
