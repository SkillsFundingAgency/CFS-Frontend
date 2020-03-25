import React from 'react';
import {createStore, Store} from "redux";
import {IStoreState, rootReducer} from "../../../reducers/rootReducer";
import {Provider} from 'react-redux';
import {mount} from "enzyme";
import {SpecificationsList} from "../../../pages/Specifications/SpecificationsList";


const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});
const store: Store<IStoreState> = createStore(
    rootReducer
);

store.dispatch = jest.fn();

describe("<SpecificationsList />", () => {
    it('will call dispatch 1 time for the initial specs search', () => {

        mount(<Provider store={store}><SpecificationsList />></Provider>);

        expect(store.dispatch).toHaveBeenCalledTimes(1);
    });
});

describe("<SpecificationsList />", () => {
    it('will have the correct breadcrumbs', () => {

        const wrapper = mount(<Provider store={store}><SpecificationsList/>></Provider>);
        expect(wrapper.find(".govuk-breadcrumbs__list").children().length).toBe(2);
    });
});


describe("<SpecificationsList />", () => {
    it('will have the correct <H1 /> title', () => {

        const wrapper = mount(<Provider store={store}><SpecificationsList/>></Provider>);
        expect(wrapper.find(".govuk-heading-xl").text()).toBe("Specifications");
    });
});

describe("<SpecificationsList />", () => {
    it('will have the correct link to Create Specifications', () => {

        const wrapper = mount(<Provider store={store}><SpecificationsList/>></Provider>);
        expect(wrapper.find("#create-specification-link").text()).toBe("Create specification");
    });
});


describe("<SpecificationsList />", () => {
    it('will have the specification table defined', () => {

        const wrapper = mount(<Provider store={store}><SpecificationsList/>></Provider>);
        expect(wrapper.find("#specification-table").children().length).toBeGreaterThan(0);
    });
});

describe("<SpecificationsList />", () => {
    it('will have the <CollapsiblePanels /> and Clear filters <Button />', () => {

        const wrapper = mount(<Provider store={store}><SpecificationsList/>></Provider>);
        expect(wrapper.find("#searchSpecifications").children().length).toBe(5);
    });
});

