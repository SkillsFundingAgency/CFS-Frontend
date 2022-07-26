import { mount } from "enzyme";
import React from "react";
import { MemoryRouter } from "react-router";

import { DownloadDataSchema } from "../../../pages/Datasets/DownloadDataSchema";

// ToDo: These tests need sorting properly so no errors occur
jest.spyOn(global.console, "error").mockImplementation(() => jest.fn());

const Adapter = require("enzyme-adapter-react-16");
const enzyme = require("enzyme");
enzyme.configure({ adapter: new Adapter() });

describe("<DownloadDataSchema />", () => {
  it("will have the correct breadcrumbs", () => {
    const wrapper = mount(
      <MemoryRouter>
        <DownloadDataSchema />
      </MemoryRouter>
    );
    expect(wrapper.find(".govuk-breadcrumbs__list").children().length).toBe(2);
  });

  it("will have the correct <H1 /> title", () => {
    const wrapper = mount(
      <MemoryRouter>
        <DownloadDataSchema />
      </MemoryRouter>
    );
    expect(wrapper.find("h1.govuk-heading-xl").text()).toBe("Download data schemas");
  });

  it("will have the correct <Breadcrumb /> for Calculate funding", () => {
    const wrapper = mount(
      <MemoryRouter>
        <DownloadDataSchema />
      </MemoryRouter>
    );
    expect(wrapper.find("Breadcrumb").at(0).text()).toBe("Home");
  });

  it("will have the correct <Breadcrumb /> for Manage data", () => {
    const wrapper = mount(
      <MemoryRouter>
        <DownloadDataSchema />
      </MemoryRouter>
    );
    expect(wrapper.find("Breadcrumb").at(1).text()).toBe("Manage data");
  });
});
