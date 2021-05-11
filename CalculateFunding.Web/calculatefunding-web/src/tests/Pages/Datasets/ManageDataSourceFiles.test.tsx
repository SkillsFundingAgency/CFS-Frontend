import React from 'react';
import {mount} from "enzyme";
import {MemoryRouter} from "react-router";
import {ManageDataSourceFiles} from "../../../pages/Datasets/ManageDataSourceFiles";


// ToDo: These tests need sorting properly so no errors occur
jest.spyOn(global.console, 'error').mockImplementation(() => jest.fn());

const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});
jest.mock("../../../components/AdminNav");

describe("<ManageDataSourceFiles />", () => {
    it('will have the correct breadcrumbs', () => {
        const wrapper = mount(<MemoryRouter><ManageDataSourceFiles/></MemoryRouter>);
        expect(wrapper.find(".govuk-breadcrumbs__list").children().length).toBe(3);
    });

    it('will have the correct <H1 /> title', () => {
        const wrapper = mount(<MemoryRouter><ManageDataSourceFiles/></MemoryRouter>);
        expect(wrapper.find("h1.govuk-heading-xl").text()).toBe("Manage data source files");
    });

    it('will have the correct <span /> subtitle for Manage data source files', () => {
        const wrapper = mount(<MemoryRouter><ManageDataSourceFiles/></MemoryRouter>);
        expect(wrapper.find("span.govuk-caption-xl").text()).toBe("Upload new or updated data source files");
    });

    it('will have the correct <a /> title for Upload a new data source', () => {
        const wrapper = mount(<MemoryRouter><ManageDataSourceFiles/></MemoryRouter>);
        expect(wrapper.find("a#upload-dataset-link").text()).toBe("Upload a new data source");
    });
});
