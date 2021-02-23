import { SimpleScheduler } from "./simple_scheduler";

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

    const scheduler = new SimpleScheduler();
    const cancel = scheduler.scheduleTimeout(() => {
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

    const scheduler = new SimpleScheduler();
    const cancel = scheduler.scheduleTimeout(() => {
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

    const scheduler = new SimpleScheduler();
    const cancel = scheduler.scheduleInterval(() => {
      called++;
    }, 5000);
    jest.advanceTimersByTime(4000);
    expect(called).toBe(0);

    // 8000
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

});