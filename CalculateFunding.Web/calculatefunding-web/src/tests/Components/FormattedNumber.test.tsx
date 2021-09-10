// @ts-nocheck

import { shallow } from "enzyme";
import React from "react";

import { FormattedNumber, NumberType } from "../../components/FormattedNumber";

describe("<FormattedNumber>", () => {
  const decimalTestCases = [
    [0, "0.00", null],
    [1, "1.00", null],
    [1.2, "1.20", null],
    [1.24, "1.24", undefined],
    [1.25, "1.25", null],
    [1.26, "1.26", null],
    [10, "10", 0],
    [10.2, "10.2", 1],
    [10.24, "10.240", 3],
    [10.25, "10.3", 1],
    [10.26, "10.3", 1],
  ];

  const moneyTestCases = [
    [0, "£0.00", null],
    [1, "£1.00", null],
    [1.2, "£1.20", null],
    [1.24, "£1.24", undefined],
    [1.25, "£1.25", null],
    [1.26, "£1.26", null],
    [10, "£10", 0],
    [10.2, "£10.2", 1],
    [10.24, "£10.240", 3],
    [10.25, "£10.3", 1],
    [10.26, "£10.3", 1],
  ];

  const percentageTestCases = [
    [0, "0.00%", null],
    [1, "1.00%", null],
    [1.2, "1.20%", null],
    [1.24, "1.24%", undefined],
    [1.25, "1.25%", null],
    [1.26, "1.26%", null],
    [10, "10%", 0],
    [10.2, "10.2%", 1],
    [10.24, "10.240%", 3],
    [10.25, "10.3%", 1],
    [10.26, "10.3%", 1],
  ];

  test.each(decimalTestCases)(
    "renders decimal numbers correctly",
    (value: number, expectedValue: string, decimalPlaces: number | null) => {
      const wrapper = shallow(
        <FormattedNumber
          value={value}
          type={NumberType.FormattedDecimalNumber}
          decimalPlaces={decimalPlaces}
        />
      );
      const result = wrapper.find("span").text();
      expect(result).toEqual(expectedValue);
    }
  );

  test.each(moneyTestCases)(
    "renders money numbers correctly",
    (value: number, expectedValue: string, decimalPlaces: number | null) => {
      const wrapper = shallow(
        <FormattedNumber value={value} type={NumberType.FormattedMoney} decimalPlaces={decimalPlaces} />
      );
      const result = wrapper.find("span").text();
      expect(result).toEqual(expectedValue);
    }
  );

  test.each(percentageTestCases)(
    "renders percentage numbers correctly",
    (value: number, expectedValue: string, decimalPlaces: number | null) => {
      const wrapper = shallow(
        <FormattedNumber value={value} type={NumberType.FormattedPercentage} decimalPlaces={decimalPlaces} />
      );
      const result = wrapper.find("span").text();
      expect(result).toEqual(expectedValue);
    }
  );
});
