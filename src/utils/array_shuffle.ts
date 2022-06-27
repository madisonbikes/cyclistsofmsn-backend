import { RandomProvider } from "./random";

/**
 * Adapted from https://github.com/sindresorhus/array-shuffle/blob/main/index.js
 * modified to use supplied random provider and typescript
 */
export const arrayShuffle = <T>(
  random: RandomProvider,
  array: Array<T>
): Array<T> => {
  array = [...array];

  for (let index = array.length - 1; index > 0; index--) {
    const newIndex = random.randomInt(0, index + 1);

    // swap values
    [array[index], array[newIndex]] = [array[newIndex], array[index]];
  }

  return array;
};
