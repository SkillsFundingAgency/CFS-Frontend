import { mount } from "enzyme";
import React from "react";

import { ConfirmationPanel } from "../../components/ConfirmationPanel";

const Adapter = require("enzyme-adapter-react-16");
const enzyme = require("enzyme");
enzyme.configure({ adapter: new Adapter() });

describe("<ConfirmationPanel />", () => {
  it(" renders a panel with the title as expected", () => {
    const wrapper = mount(<ConfirmationPanel title="Test title" children="Test body" hidden={false} />);

    const actual = wrapper.find("h1.govuk-panel__title");

    expect(actual.text()).toBe("Test title");
  });
  it(" renders a panel with the body as expected", () => {
    const wrapper = mount(<ConfirmationPanel title="Test title" children="Test body" hidden={false} />);

    const actual = wrapper.find("div.govuk-panel__body");

    expect(actual.text()).toBe("Test body");
  });

  it(" hides itself when passed a true in hidden prop", () => {
    const wrapper = mount(<ConfirmationPanel title="Test title" children="Test body" hidden={true} />);

    const actual = wrapper.find("div.govuk-panel");

    expect(actual.props().hidden).toBeTruthy();
  });
});
