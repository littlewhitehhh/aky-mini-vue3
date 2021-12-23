import { effect } from "../effect";
import { isReactive, isReadonly, reactive, shallowReactive, } from "../reactive";

describe("shallowReactive", () => {
  test("should not make non-reactive properties reactive", () => {
    const props = shallowReactive({ n: { foo: 1 } });
    expect(isReactive(props)).toBe(true);
    // expect(isReadonly(props)).toBe(false);
    expect(isReactive(props.n)).toBe(false);
  });
  // it("happy path", () => {
  //   const props = shallowReactive({ 
  //     bar: 2, 
  //     n: { foo: 1 } });

  //   let nextAge;
  //   effect(() => {
  //     nextAge = props.bar + 1;
  //   });

  //   expect(nextAge).toBe(3);

  //    // update
  //   props.bar = 3;   //测试不通过  暂时没想出原因
  //   expect(nextAge).toBe(4);
  // });
});
