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
    expect(wrapper.find(".govuk-breadcrumbs__list").children().length).toBe(3);
  });

  it("will have the correct <H1 /> title", () => {
    const wrapper = mount(
      <MemoryRouter>
        <DownloadDataSchema />
      </MemoryRouter>
    );
    expect(wrapper.find("h1.govuk-heading-xl").text()).toBe("Download data schema template");
  });

  it("will have the correct <Breadcrumb /> for Calculate funding", () => {
    const wrapper = mount(
      <MemoryRouter>
        <DownloadDataSchema />
      </MemoryRouter>
    );
    expect(wrapper.find("Breadcrumb").at(0).text()).toBe("Calculate funding");
  });

  it("will have the correct <Breadcrumb /> for Manage data", () => {
    const wrapper = mount(
      <MemoryRouter>
        <DownloadDataSchema />
      </MemoryRouter>
    );
    expect(wrapper.find("Breadcrumb").at(1).text()).toBe("Manage data");
  });

  it("will have the correct <Breadcrumb /> for Download data schema template", () => {
    const wrapper = mount(
      <MemoryRouter>
        <DownloadDataSchema />
      </MemoryRouter>
    );
    expect(wrapper.find("Breadcrumb").at(2).text()).toBe("Download data schema template");
  });

  it("will have the correct number of collapsible panels", () => {
    const wrapper = mount(
      <MemoryRouter>
        <DownloadDataSchema />
      </MemoryRouter>
    );
    expect(wrapper.find("CollapsiblePanel").length).toBe(2);
  });

  it("will have the correct collapsible panel for searching", () => {
    const wrapper = mount(
      <MemoryRouter>
        <DownloadDataSchema />
      </MemoryRouter>
    );
    expect(wrapper.find("CollapsiblePanel").at(0).prop("title")).toBe("Search");
  });

  it("will have the correct collapsible panel for filtering by funding stream", () => {
    const wrapper = mount(
      <MemoryRouter>
        <DownloadDataSchema />
      </MemoryRouter>
    );
    expect(wrapper.find("CollapsiblePanel").at(1).prop("title")).toBe("Filter by funding stream");
  });
});
