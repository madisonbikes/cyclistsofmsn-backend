// a mock random implementation that always returns the same number (50) for testing
// purposes or the lower/upper bound if the value is out of range
const SEED = 50;
export const randomInt = (min: number, max: number): number => {
  if (min > SEED) {
    return min;
  }
  if (max <= SEED) {
    return max - 1;
  }
  return SEED;
};
