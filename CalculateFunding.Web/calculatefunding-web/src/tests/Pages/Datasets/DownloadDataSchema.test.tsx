import React from 'react';
import {mount} from "enzyme";
import {MemoryRouter} from "react-router";
import {DownloadDataSchema} from "../../../pages/Datasets/DownloadDataSchema";

const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});

describe("<DownloadDataSchema />", () => {
    it('will have the correct breadcrumbs', () => {
        const wrapper = mount(<MemoryRouter><DownloadDataSchema /></MemoryRouter>);
        expect(wrapper.find(".govuk-breadcrumbs__list").children().length).toBe(3);
    });

    it('will have the correct <H1 /> title', () => {
        const wrapper = mount(<MemoryRouter><DownloadDataSchema /></MemoryRouter>);
        expect(wrapper.find("h1.govuk-heading-xl").text()).toBe("Download data schema template");
    });

    it('will have the correct <Button /> for searching the download schema', () => {
        const wrapper = mount(<MemoryRouter><DownloadDataSchema /></MemoryRouter>);
        expect(wrapper.find("button#submit-search").text()).toBe("Search");
    });

    it('will have the correct <label /> for Search data schema templates', () => {
        const wrapper = mount(<MemoryRouter><DownloadDataSchema /></MemoryRouter>);
        expect(wrapper.find("label.govuk-label").text()).toBe("Search data schema templates");
    });

    it('will have the correct <Breadcrumb /> for Calculate funding', () => {
        const wrapper = mount(<MemoryRouter><DownloadDataSchema /></MemoryRouter>);
        expect(wrapper.find("Breadcrumb").at(0).text()).toBe("Calculate funding");
    });

    it('will have the correct <Breadcrumb /> for Manage data', () => {
        const wrapper = mount(<MemoryRouter><DownloadDataSchema /></MemoryRouter>);
        expect(wrapper.find("Breadcrumb").at(1).text()).toBe("Manage data");
    });

    it('will have the correct <Breadcrumb /> for Download data schema template', () => {
        const wrapper = mount(<MemoryRouter><DownloadDataSchema /></MemoryRouter>);
        expect(wrapper.find("Breadcrumb").at(2).text()).toBe("Download data schema template");
    });


});