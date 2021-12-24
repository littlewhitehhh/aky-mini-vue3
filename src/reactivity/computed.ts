import { ReactiveEffect } from "./effect";

//computed 的类实现
class computedRefIpml {
  private _fn: any;
  private _drity: boolean = true;
  private _value: any;
  private _effect: ReactiveEffect;

  constructor(fn) {
    this._fn = fn;

    this._effect = new ReactiveEffect(fn, {
      scheduler: () => {
        if (!this._drity) {
          this._drity = true;
        }
      },
    });
  }

  get value() {
    if (this._drity) {
      this._drity = false;
      // this._value = this._fn();
      this._value = this._effect.run();
    }
    return this._value;
  }
}

export function computed(fn) {
  return new computedRefIpml(fn);
}
