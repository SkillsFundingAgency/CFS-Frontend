import React from 'react';
import {createStore, Store} from "redux";
import {Provider} from 'react-redux';
import {mount} from "enzyme";
import {IStoreState, rootReducer} from "../../reducers/rootReducer";
import {Approvals} from "../../pages/Approvals";

const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});
const store: Store<IStoreState> = createStore(
    rootReducer
);

store.dispatch = jest.fn();

describe("<Approvals />", () => {
    it('will have the correct breadcrumbs', () => {
        const wrapper = mount(<Provider store={store}><Approvals/>></Provider>);
        expect(wrapper.find(".govuk-breadcrumbs__list").children().length).toBe(2);
    });
});


describe("<Approvals />", () => {
    it('will have the correct <H1 /> title', () => {
        const wrapper = mount(<Provider store={store}><Approvals/>></Provider>);
        expect(wrapper.find(".govuk-heading-xl").text()).toBe("Funding approvals");
    });
});

describe("<Approvals />", () => {
    it('will have the correct <H3 /> title for choose specification', () => {
        const wrapper = mount(<Provider store={store}><Approvals/>></Provider>);
        expect(wrapper.find("#choose-specification-approval-title>a").text()).toBe("Choose a specification to approve and release");
    });
});


describe("<Approvals />", () => {
    it('will have the correct <H3 /> title for choose specification', () => {
        const wrapper = mount(<Provider store={store}><Approvals/>></Provider>);
        expect(wrapper.find("#approve-release-funding-title>a").text()).toBe("Approve and release funding");
    });
});
