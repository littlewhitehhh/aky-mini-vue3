import { reactive } from "../reactive";
import { effect, stop } from "../effect";

describe("effect", () => {
  it("happy path", () => {
    const user = reactive({
      age: 10,
    });

    let nextAge;
    effect(() => {
      nextAge = user.age + 1;
    });
    // effect(() => {
    //   user.age++;
    // });

    expect(nextAge).toBe(11);
    // update
    user.age++;
    expect(nextAge).toBe(12);
  });
  it("should return runner when call effect", () => {
    // 1、调用effect(fn) 会返回一个function runner函数
    //2、调用runner() 会再次调用fn -> 返回fn的返回值

    let foo = 0;
    const runner = effect(() => {
      foo++;
      return foo;
    });

    expect(foo).toBe(1);
    runner(); //函数执行,说明了effect返回了一个函数？并且返回的为传入的函数？
    expect(foo).toBe(2);
    expect(runner()).toBe(3);
  });

  it("scheduler", () => {
    //通过effect第二个参数给定一个scheduler的fn
    // effect 第一次执行的时候，还会执行第一个fn参数
    //当响应式对象 update 不会执行第一个fn参数，而是执行scheduler
    // 当执行runner的时候，会执行fn
    let dummy;
    let run: any;
    const scheduler = jest.fn(() => {
      run = runner;
    });
    const obj = reactive({ foo: 1 });
    const runner = effect(
      //effect 传入了两个参数  1回调函数 2 option对象
      () => {
        dummy = obj.foo;
      },
      { scheduler }
    );
    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);

    //should be called on first trigger
    obj.foo++;
    expect(scheduler).toHaveBeenCalledTimes(1); // scheduler被调用了一次
    //should not run yet
    expect(dummy).toBe(1);
    //manually run
    run();
    //should have run
    expect(dummy).toBe(2);
    //
  });

  it("stop", () => {
    // stop接受effect执行返回的函数作为参数。
    //用一个变量runner接受effect执行返回的函数
    //调用stop并传入runner后，当传入的函数依赖的响应式对象的 property 的值更新时不会再执行该函数，
    //只有当调用runner时才会恢复执行该函数。
    let dummy;
    const obj = reactive({ prop: 1 });
    const runner = effect(() => {
      dummy = obj.prop;
    });
    obj.prop = 2;
    expect(dummy).toBe(2);
    stop(runner);
    obj.prop = 3;
    expect(dummy).toBe(2); // trigger失效  代表依赖清空？怎么清空依赖呢？
    obj.prop++;
    expect(dummy).toBe(2);
    runner(); // runner  执行 effect.run  执行了fn -> obj.prop 触发了get  依赖又收集了
    expect(dummy).toBe(4);
  });

  it("onStop", () => {
    const obj = reactive({
      foo: 1,
    });
    const onStop = jest.fn();
    let dummy;
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      { onStop }
    );
    stop(runner);
    expect(onStop).toBeCalledTimes(1);
  });

  it("cleanup effect", () => {
    let dummy;
    let record;
    const obj = reactive({ prop: 1, foo: 2 });
    const runner = effect(() => {
      dummy = obj.prop;
      record = obj.foo;
    });
    expect(dummy).toBe(1);
    expect(record).toBe(2);
    stop(runner);
    //should not trigger effect
    obj.foo = 3;
    expect(dummy).toBe(1);
    expect(record).toBe(2);
  });
});
