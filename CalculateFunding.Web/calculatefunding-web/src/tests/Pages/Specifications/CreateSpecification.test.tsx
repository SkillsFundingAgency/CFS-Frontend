import React from 'react';
import {createStore, Store} from "redux";
import {IStoreState, rootReducer} from "../../../reducers/rootReducer";
import {Provider} from 'react-redux';
import {mount} from "enzyme";
import {CreateSpecification} from "../../../pages/Specifications/CreateSpecification";
import {MemoryRouter} from "react-router";

const store: Store<IStoreState> = createStore(
    rootReducer
);

store.dispatch = jest.fn();

describe("<CreateSpecification />", () => {
    it('will have the correct breadcrumbs', () => {

        const wrapper = mount(<MemoryRouter><Provider store={store}><CreateSpecification /></Provider></MemoryRouter>);
        expect(wrapper.find(".govuk-breadcrumbs__list").children().length).toBe(3);
    });

    it('will have the correct <H1 /> title', () => {

        const wrapper = mount(<MemoryRouter><Provider store={store}><CreateSpecification />></Provider></MemoryRouter>);
        expect(wrapper.find(".govuk-fieldset__heading").text()).toBe("Create specification");
    });
});
