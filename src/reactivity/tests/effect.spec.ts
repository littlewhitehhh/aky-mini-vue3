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
    // 1、调用effect(fn) 会返回一个runner函数 -> 调用runner() 会再次调用fn -> 调用fn后会返回fn的返回值

    let foo = 0;
    const runner = effect(() => {
      foo++;
      return foo;
    });

    expect(foo).toBe(1);
    runner()   //函数执行,说明了effect返回了一个函数？并且返回的为传入的函数？
    expect(foo).toBe(2)
    expect(runner()).toBe(3);
  });
});
