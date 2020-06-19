import React from 'react';
import {createStore, Store} from "redux";
import {Provider} from 'react-redux';
import {mount} from "enzyme";
import {IStoreState, rootReducer} from "../../reducers/rootReducer";
import {Approvals} from "../../pages/Approvals";
import {MemoryRouter} from "react-router";

const store: Store<IStoreState> = createStore(
    rootReducer
);

store.dispatch = jest.fn();

describe("<Approvals />", () => {
    it('will have the correct breadcrumbs', () => {
        const wrapper = mount(<MemoryRouter><Provider store={store}><Approvals/>></Provider></MemoryRouter>);
        expect(wrapper.find(".govuk-breadcrumbs__list").children().length).toBe(2);
    });

    it('will have the correct <H1 /> title', () => {
        const wrapper = mount(<MemoryRouter><Provider store={store}><Approvals/>></Provider></MemoryRouter>);
        expect(wrapper.find(".govuk-heading-xl").text()).toBe("Funding approvals");
    });
});
