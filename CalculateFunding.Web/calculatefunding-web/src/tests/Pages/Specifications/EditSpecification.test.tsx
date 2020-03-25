import React from 'react';
import {createStore, Store} from "redux";
import {IStoreState, rootReducer} from "../../../reducers/rootReducer";
import {Provider} from 'react-redux';
import {mount} from "enzyme";
import {EditSpecification, EditSpecificationRouteProps} from "../../../pages/Specifications/EditSpecification";
import {createBrowserHistory, createLocation} from "history";
import {match} from "react-router";

const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});
const store: Store<IStoreState> = createStore(
    rootReducer
);

const history = createBrowserHistory();
const location = createLocation("", "", "", {search: "", pathname: "", hash: "", key: "", state: ""});
const editSpecificationRoutePropsMatch: match<EditSpecificationRouteProps> = {
    params: {
        specificationId: "056fcfcd-fb12-45ed-8a1b-079a0e2fc8c5",
    },
    isExact: true,
    path: "",
    url: ""
};

store.dispatch = jest.fn();

describe("<EditSpecification />", () => {
    it('will have the correct breadcrumbs', () => {

        const wrapper = mount(<Provider store={store}><EditSpecification match={editSpecificationRoutePropsMatch} history={history} location={location} />></Provider>);
        expect(wrapper.find(".govuk-breadcrumbs__list").children().length).toBe(3);
    });
});

describe("<EditSpecification />", () => {
    it('will have the correct <H1 /> title', () => {

        const wrapper = mount(<Provider store={store}><EditSpecification match={editSpecificationRoutePropsMatch} history={history} location={location} />></Provider>);
        expect(wrapper.find(".govuk-fieldset__heading").text()).toBe("Edit specification");
    });
});
