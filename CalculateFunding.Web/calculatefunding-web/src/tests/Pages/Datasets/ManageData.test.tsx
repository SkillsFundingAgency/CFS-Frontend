import React from 'react';
import {createStore, Store} from "redux";
import {Provider} from 'react-redux';
import {mount} from "enzyme";
import {ManageData} from "../../../pages/Datasets/ManageData";
import {IStoreState, rootReducer} from "../../../reducers/rootReducer";
import {MemoryRouter} from "react-router";

const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});
const store: Store<IStoreState> = createStore(
    rootReducer
);

store.dispatch = jest.fn();

describe("<ManageData />", () => {
    it('will have the correct breadcrumbs', () => {
        const wrapper = mount(<MemoryRouter><Provider store={store}><ManageData/></Provider></MemoryRouter>);
        expect(wrapper.find(".govuk-breadcrumbs__list").children().length).toBe(2);
    });

    it('will have the correct <H1 /> title', () => {
        const wrapper = mount(<MemoryRouter><Provider store={store}><ManageData/></Provider></MemoryRouter>);
        expect(wrapper.find("h1.govuk-heading-xl").text()).toBe("Manage data");
    });

    it('will have the correct <H3 /> title for Manage data source files', () => {
        const wrapper = mount(<MemoryRouter><Provider store={store}><ManageData/></Provider></MemoryRouter>);
        expect(wrapper.find("h3#manage-data-source-files-title>Link").text()).toBe("Manage data source files");
    });

    it('will have the correct <p /> description for Manage data source files', () => {
        const wrapper = mount(<MemoryRouter><Provider store={store}><ManageData/></Provider></MemoryRouter>);
        expect(wrapper.find("p.govuk-body").at(0).text()).toBe("Upload new or updated data source files");
    });

    it('will have the correct <H3 /> title for Map data source files to datasets for a specification', () => {
        const wrapper = mount(<MemoryRouter><Provider store={store}><ManageData/></Provider></MemoryRouter>);
        expect(wrapper.find("h3#map-data-source-files-title>Link").text()).toBe("Map data source files to datasets for a specification");
    });

    it('will have the correct <p /> description for Map data source files to datasets for a specification', () => {
        const wrapper = mount(<MemoryRouter><Provider store={store}><ManageData/></Provider></MemoryRouter>);
        expect(wrapper.find("p.govuk-body").at(1).text()).toBe("Select the data source file a dataset uses");
    });

    it('will have the correct <H3 /> title for Download data schemas', () => {
        const wrapper = mount(<MemoryRouter><ManageData/></MemoryRouter>);
        expect(wrapper.find("#download-data-schemas-title>Link").text()).toBe("Download data schemas");
    });

    it('will have the correct <p /> description for Download data schemas', () => {
        const wrapper = mount(<MemoryRouter><Provider store={store}><ManageData/></Provider></MemoryRouter>);
        expect(wrapper.find("p.govuk-body").at(2).text()).toBe("Download the data schema for data source");
    });
});
