import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluate, show } from "./calc.ts";

test("the calculator follows the usual rules", () => {
  assert.equal(evaluate("2+3×4"), 14);
  assert.equal(evaluate("(2+3)×4"), 20);
  assert.equal(evaluate("2^3^2"), 512);
  assert.equal(evaluate("−3^2"), -9);
  assert.equal(evaluate("2π"), Number((2 * Math.PI).toPrecision(12)));
  assert.equal(evaluate("sin(30)"), 0.5);
  assert.equal(evaluate("sin(π/6)", { deg: false }), 0.5);
  assert.equal(evaluate("√(2×9,8×45)"), Number(Math.sqrt(2 * 9.8 * 45).toPrecision(12)));
  assert.equal(evaluate("6.67E-11×5.97E24/(6.37E6)²"), Number((6.67e-11 * 5.97e24 / 6.37e6 ** 2).toPrecision(12)));
  assert.equal(evaluate("Ans×2", { ans: 21 }), 42);
  assert.equal(evaluate("log(1000)+ln(1)"), 3);
  assert.equal(evaluate("asin(0.5)"), 30);
  assert.equal(evaluate("3(4+1"), 15); // an unclosed bracket closes itself
  assert.throws(() => evaluate("2+"));
  assert.throws(() => evaluate("1/0"));
  assert.equal(show(9.81), "9,81");
  assert.equal(show(6.67e-11), "6,67 × 10^-11");
});
