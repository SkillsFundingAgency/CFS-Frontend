import React from 'react';
import {createStore, Store} from "redux";
import {Provider} from 'react-redux';
import {mount} from "enzyme";
import {ManageData} from "../../pages/ManageData";
import {IStoreState, rootReducer} from "../../reducers/rootReducer";

const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});
const store: Store<IStoreState> = createStore(
    rootReducer
);

store.dispatch = jest.fn();

describe("<ManageData />", () => {
    it('will have the correct breadcrumbs', () => {
        const wrapper = mount(<Provider store={store}><ManageData/>></Provider>);
        expect(wrapper.find(".govuk-breadcrumbs__list").children().length).toBe(2);
    });
});


describe("<ManageData />", () => {
    it('will have the correct <H1 /> title', () => {
        const wrapper = mount(<Provider store={store}><ManageData/>></Provider>);
        expect(wrapper.find("h1.govuk-heading-xl").text()).toBe("Manage data");
    });
});


describe("<ManageData />", () => {
    it('will have the correct <H3 /> title for Manage data source files', () => {
        const wrapper = mount(<Provider store={store}><ManageData/>></Provider>);
        expect(wrapper.find("h3#manage-data-source-files-title>a").text()).toBe("Manage data source files");
    });
});

describe("<ManageData />", () => {
    it('will have the correct <H3 /> title for Map data source files to datasets for a specification', () => {
        const wrapper = mount(<Provider store={store}><ManageData/>></Provider>);
        expect(wrapper.find("h3#map-data-source-files-title>a").text()).toBe("Map data source files to datasets for a specification");
    });
});

describe("<ManageData />", () => {
    it('will have the correct <H3 /> title for Download data schemas', () => {
        const wrapper = mount(<Provider store={store}><ManageData/>></Provider>);
        expect(wrapper.find("h3#download-data-schemas-title>a").text()).toBe("Download data schemas");
    });
});
