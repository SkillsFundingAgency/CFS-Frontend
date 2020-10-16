import React from 'react';
import {createStore, Store} from "redux";
import {IStoreState, rootReducer} from "../../../reducers/rootReducer";
import {Provider} from 'react-redux';
import {mount} from "enzyme";
import {SpecificationsList} from "../../../pages/Specifications/SpecificationsList";
import {MemoryRouter} from "react-router";

const store: Store<IStoreState> = createStore(
    rootReducer
);

store.dispatch = jest.fn();

describe("<SpecificationsList />", () => {
    beforeEach(() => {
    })
    it('will have the correct breadcrumbs', () => {

        const wrapper = mount(<MemoryRouter><Provider store={store}><SpecificationsList/></Provider></MemoryRouter>);
        expect(wrapper.find(".govuk-breadcrumbs__list").children().length).toBe(2);
    });

    it('will have the correct <H1 /> title', () => {

        const wrapper = mount(<MemoryRouter><Provider store={store}><SpecificationsList/></Provider></MemoryRouter>);
        expect(wrapper.find(".govuk-heading-xl").text()).toBe("Specifications");
    });

    it('will have the correct link to Create Specifications', () => {
        const wrapper = mount(<MemoryRouter><Provider store={store}><SpecificationsList/></Provider></MemoryRouter>);
        expect(wrapper.find("#create-specification-link").first().text()).toBe("Create specification");
    });

    it('will have the specification table defined', () => {

        const wrapper = mount(<MemoryRouter><Provider store={store}><SpecificationsList/></Provider></MemoryRouter>);
        expect(wrapper.find("#specification-table").children().length).toBeGreaterThan(0);
    });

    it('will have the <CollapsiblePanels /> and Clear filters <Button />', () => {

        const wrapper = mount(<MemoryRouter><Provider store={store}><SpecificationsList/></Provider></MemoryRouter>);
        expect(wrapper.find("#searchSpecifications").children().length).toBe(5);
    });
});

