import { render, screen } from "@testing-library/react";
import React from "react";

import { DateTimeFormatter } from "../../components/DateTimeFormatter";

const renderMilitaryDateTimeFormatter = (date: Date) => {
  return render(<DateTimeFormatter date={date} militaryTime={true} />);
};
const renderDateTimeFormatter = (date: Date) => {
  return render(<DateTimeFormatter date={date} militaryTime={false} />);
};

describe("<DateTimeFormatter />", () => {
  it(" renders a panel", async () => {
    renderMilitaryDateTimeFormatter(new Date(2000, 0, 1, 0, 0));
    expect(screen.getByTestId(/datetime-formatter/)).toBeDefined();
  });

  it(" has the correct date and time", () => {
    renderMilitaryDateTimeFormatter(new Date(Date.UTC(2020, 2, 11, 12, 46)));
    expect(screen.getByText(/11 March 2020 12:46/));
  });

  it("can parse a JSON date time in GMT and accept it", () => {
    const date: Date = new Date("2016-01-25T09:08:34.123+00:00");
    renderMilitaryDateTimeFormatter(date);
    expect(screen.getByText(/25 January 2016 09:08/));
  });

  it("can parse a JSON date time in BST and accept it", () => {
    const date: Date = new Date("2020-05-25T08:11:00.000+00:00");
    renderMilitaryDateTimeFormatter(date);
    expect(screen.getByText(/25 May 2020 09:11/));
  });

  it("can parse a JSON date time in GMT just before changeover to BST and accept it", () => {
    const date: Date = new Date("2021-03-28T00:59:59.999+00:00");
    renderMilitaryDateTimeFormatter(date);
    expect(screen.getByText(/28 March 2021 00:59/));
  });

  it("can parse a JSON date time in GMT just after changeover to BST and accept it", () => {
    const date: Date = new Date("2021-03-28T01:00:00.000+00:00");
    renderMilitaryDateTimeFormatter(date);
    expect(screen.getByText(/28 March 2021 02:00/));
  });

  it("has only the date time in the span", () => {
    renderMilitaryDateTimeFormatter(new Date(Date.UTC(1995, 10, 29, 13, 32)));
    expect(screen.getByTestId(/datetime-formatter/).textContent).toBe("29 November 1995 13:32");
  });

  it("has only a 12 hour date time in the span", () => {
    renderDateTimeFormatter(new Date(Date.UTC(1971, 11, 28, 0, 0)));
    expect(screen.getByTestId(/datetime-formatter/).textContent).toBe("28 December 1971 12:00 AM");
  });
});
