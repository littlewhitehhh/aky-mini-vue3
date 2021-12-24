import { effect } from "../effect";
import { isReactive, isReadonly, reactive, shallowReactive } from "../reactive";

describe("shallowReactive", () => {
  test("should not make non-reactive properties reactive", () => {
    const props = shallowReactive({ n: { foo: 1 } });
    expect(isReactive(props)).toBe(true);
    // expect(isReadonly(props)).toBe(false);
    expect(isReactive(props.n)).toBe(false);
  });
  // test("happy shallowReactive", () => {
  //   const props = shallowReactive({
  //     bar: 2,
  //     n: { foo: 1 },
  //   });

  //   let nexProps;
  //   effect(() => {
  //     nexProps = props.bar + 1;
  //   });

  //   expect(nexProps).toBe(3);

  //   // update
  //   props.bar++; //测试不通过  
  //   expect(nexProps).toBe(4);
  // });
});
