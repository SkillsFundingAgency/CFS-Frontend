import React from 'react';
import {createStore, Store} from "redux";
import {Provider} from 'react-redux';
import {mount} from "enzyme";
import {IStoreState, rootReducer} from "../../../reducers/rootReducer";
import {MemoryRouter} from "react-router";
import {ManageDataSourceFiles} from "../../../pages/Datasets/ManageDataSourceFiles";

const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});

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
        expect(wrapper.find("span.govuk-caption-xl").text()).toBe("Manage data source files or map them to datasets for a specification");
    });

    it('will have the correct <a /> title for Upload a new data source', () => {
        const wrapper = mount(<MemoryRouter><ManageDataSourceFiles/></MemoryRouter>);
        expect(wrapper.find("a#upload-dataset-link").text()).toBe("Upload a new data source");
    });
});