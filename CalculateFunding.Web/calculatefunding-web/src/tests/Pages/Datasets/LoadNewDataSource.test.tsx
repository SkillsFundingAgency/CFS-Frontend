import React from 'react';
import {mount} from "enzyme";
import {MemoryRouter} from "react-router";
import {LoadNewDataSource} from "../../../pages/Datasets/LoadNewDataSource";

const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});

describe("<DatasetHistory />", () => {
    it('will have the correct breadcrumbs', () => {
        const wrapper = mount(<MemoryRouter><LoadNewDataSource/></MemoryRouter>);
        expect(wrapper.find(".govuk-breadcrumbs__list").children().length).toBe(4);
    });

    it('will find the title Upload new data source', () => {
        const wrapper = mount(<MemoryRouter><LoadNewDataSource/></MemoryRouter>);
        expect(wrapper.find(".govuk-heading-xl").text()).toBe("Upload new data source");
    });

    it('will find the description Load a new data source file to create a dataset to use in calculations.', () => {
        const wrapper = mount(<MemoryRouter><LoadNewDataSource/></MemoryRouter>);
        expect(wrapper.find("p.govuk-body").at(1).text()).toBe("Load a new data source file to create a dataset to use in calculations.");
    });
});
