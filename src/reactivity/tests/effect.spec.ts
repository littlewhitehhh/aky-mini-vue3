import { reactive } from "../reactive";
import { effect } from "../effect";

describe("effect", () => {
  it("happy path", () => {
    const user = reactive({
      age: 10,
    });

    let nextAge;
    effect(() => {
      nextAge = user.age + 1;
    });

    expect(nextAge).toBe(11);

    // update
    user.age++;
    expect(nextAge).toBe(12);
  });
  it("should return runner when call effect", () => {
    let foo = 0;
    const runner = effect(() => {
      foo++;
      return foo;
    });

    expect(foo).toBe(1);
    // runner()
    // expect(foo).toBe(2)
    // expect(runner()).toBe(3);
  });
});
