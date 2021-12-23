import { reactive, isReactive, isProxy } from "../reactive";
describe("reactive", () => {
  it("happy path", () => {
    const original = { foo: 1 };
    const observed = reactive(original);
    expect(observed).not.toBe(original); //检测obseved ！== original
    expect(observed.foo).toBe(1);

    //isReactive
    expect(isReactive(observed)).toBe(true);
    expect(isReactive(original)).toBe(false);


    //isProxy
    expect(isProxy(observed)).toBe(true);
    expect(isProxy(original)).toBe(false);
  });
});
