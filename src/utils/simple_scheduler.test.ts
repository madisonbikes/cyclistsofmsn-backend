import { scheduleOnce, scheduleRepeat } from "./simple_scheduler";

describe("simple scheduler", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("call timeout executes method", () => {
    let called = 0;

    const cancel = scheduleOnce(() => {
      called++;
    }, 5000);
    jest.advanceTimersByTime(4000);
    expect(called).toBe(0);
    jest.advanceTimersByTime(4000);
    expect(called).toBe(1);
    jest.advanceTimersByTime(4000);
    expect(called).toBe(1);

    cancel.cancel();
  });

  it("call timeout executes async method", () => {
    let called = 0;

    const cancel = scheduleOnce(() => {
      called++;
    }, 5000);
    jest.advanceTimersByTime(4000);
    expect(called).toBe(0);
    jest.advanceTimersByTime(4000);
    expect(called).toBe(1);
    jest.advanceTimersByTime(4000);
    expect(called).toBe(1);

    cancel.cancel();
  });

  it("call timeout cancellation works", () => {
    let called = 0;

    const cancel = scheduleOnce(() => {
      called++;
    }, 5000);
    jest.advanceTimersByTime(4000);
    expect(called).toBe(0);
    cancel.cancel();
    jest.advanceTimersByTime(4000);
    expect(called).toBe(0);
  });

  it("call interval executes method twice then cancel", () => {
    let called = 0;

    const cancel = scheduleRepeat(() => {
      called++;
    }, 5000);
    jest.advanceTimersByTime(4000);
    expect(called).toBe(0);

    // 8000 (cross interval boundary)
    jest.advanceTimersByTime(4000);
    expect(called).toBe(1);

    // 12000 (cross interval boundary)
    jest.advanceTimersByTime(4000);
    expect(called).toBe(2);
    cancel.cancel();

    // 16000 (cross interval boundary)
    jest.advanceTimersByTime(4000);
    expect(called).toBe(2);
  });

  it("call interval with delay executes method twice then cancel", () => {
    let called = 0;

    const cancel = scheduleRepeat(
      () => {
        called++;
      },
      5000,
      2000,
    );
    jest.advanceTimersByTime(3000);
    expect(called).toBe(1);

    // 6000
    jest.advanceTimersByTime(3000);
    expect(called).toBe(1);

    // 10000
    jest.advanceTimersByTime(4000);
    expect(called).toBe(2);

    // 14000 (cross interval boundary)
    jest.advanceTimersByTime(4000);
    expect(called).toBe(3);
    cancel.cancel();

    // 16000 (cross interval boundary)
    jest.advanceTimersByTime(4000);
    expect(called).toBe(3);
  });
});
