import { isNumber } from "../../helpers/numberHelper";

describe("numberHelper tests", () => {
  it("returns false for null", () => {
    const value: number | null = null;
    expect(isNumber(value)).toEqual(false);
  });
  it("returns false for undefined", () => {
    const value: number | undefined = undefined;
    expect(isNumber(value)).toEqual(false);
  });
  it("returns true for number variable", () => {
    const value: number | undefined = 123;
    expect(isNumber(value)).toEqual(true);
  });
  it("returns false for hex", () => {
    expect(isNumber("23d5")).toEqual(false);
  });
  it("returns false for empty string", () => {
    expect(isNumber("")).toEqual(false);
  });
  it("returns true for an integer number", () => {
    expect(isNumber(123)).toEqual(true);
  });
  it("returns true for string of an integer number", () => {
    expect(isNumber("123")).toEqual(true);
  });
  it("returns true for a zero string", () => {
    expect(isNumber("0")).toEqual(true);
  });
  it("returns true for a zero", () => {
    expect(isNumber(0)).toEqual(true);
  });
  it("returns true for string of floating point number", () => {
    expect(isNumber("123.574")).toEqual(true);
  });
  it("returns true for string of a negative number", () => {
    expect(isNumber("-123.574")).toEqual(true);
  });
});
