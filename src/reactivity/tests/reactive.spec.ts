import { reactive } from "../reactive";
describe("reactive", () => {
  it("happy path", () => {
    const original = { foo: 1 };
    const observed = reactive(original);
    expect(observed).not.toBe(original); //检测obseved ！== original
    expect(observed.foo).toBe(1);
  });
});
