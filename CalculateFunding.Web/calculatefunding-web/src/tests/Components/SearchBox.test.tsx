import { mount } from "enzyme";
import React from "react";

import { SearchBox } from "../../components/SearchBox";

describe("<SearchBox />", () => {
  it("renders correctly", () => {
    const mockCallback = jest.fn();
    const component = mount(<SearchBox callback={mockCallback} timeout={0} />);
    expect(component.render()).toBeTruthy();
  });
});
