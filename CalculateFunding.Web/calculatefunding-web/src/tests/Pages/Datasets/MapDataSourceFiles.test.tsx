import {mount} from "enzyme";
import {MapDataSourceFiles} from "../../../pages/Datasets/MapDataSourceFiles";
import React from "react";
import {MemoryRouter} from "react-router";


// ToDo: These tests need sorting properly so no errors occur
jest.spyOn(global.console, 'error').mockImplementation(() => jest.fn());

describe('<MapDataSourceFiles />', () => {
    it("renders the page top level div", () => {
        const wrapper = mount(<MemoryRouter><MapDataSourceFiles /></MemoryRouter>);
        expect(wrapper.find("div#map-datasource-files")).toBeTruthy();
    });

    it("has the correct wording for the loading status", () => {
        const wrapper = mount(<MemoryRouter><MapDataSourceFiles /></MemoryRouter>);
        expect(wrapper.find("div.govuk-grid-column-two-thirds>LoadingStatus").contains("Loading specifications")).toBeTruthy();
    })
});