import { mount } from "enzyme";
import { DateTime } from "luxon";
import React from "react";

import { DateInput } from "../../components/DateInput";

function mockCallback() {
  return false;
}

describe("Rendering the <DateInput> component", () => {
  const wrapper = mount(<DateInput date={new Date(0)} callback={mockCallback} inputName={"DateInputTest"} />);

  it(" with the correct heading label", () => {
    expect(wrapper.find("label").at(0).text()).toEqual("Day");
  });

  it(" with the correct input", () => {
    expect(wrapper.find("input#DateInputTest")).toHaveLength(1);
  });
});
