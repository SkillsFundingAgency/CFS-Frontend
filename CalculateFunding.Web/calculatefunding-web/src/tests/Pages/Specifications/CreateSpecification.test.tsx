import React from 'react';
import {createStore, Store} from "redux";
import {IStoreState, rootReducer} from "../../../reducers/rootReducer";
import {Provider} from 'react-redux';
import {mount} from "enzyme";
import {CreateSpecification} from "../../../pages/Specifications/CreateSpecification";

const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});
const store: Store<IStoreState> = createStore(
    rootReducer
);

store.dispatch = jest.fn();

describe("<CreateSpecification />", () => {
    it('will have the correct breadcrumbs', () => {

        const wrapper = mount(<Provider store={store}><CreateSpecification/>></Provider>);
        expect(wrapper.find(".govuk-breadcrumbs__list").children().length).toBe(3);
    });
});

describe("<CreateSpecification />", () => {
    it('will have the correct <H1 /> title', () => {

        const wrapper = mount(<Provider store={store}><CreateSpecification/>></Provider>);
        expect(wrapper.find(".govuk-fieldset__heading").text()).toBe("Create specification");
    });
});
