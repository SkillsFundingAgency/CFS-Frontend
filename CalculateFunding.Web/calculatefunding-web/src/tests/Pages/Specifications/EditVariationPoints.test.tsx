import React from 'react';
import {createStore, Store} from "redux";
import {IStoreState, rootReducer} from "../../../reducers/rootReducer";
import {Provider} from 'react-redux';
import {mount} from "enzyme";
import {createBrowserHistory, createLocation} from "history";
import {match, MemoryRouter} from "react-router";
import {EditVariationPoints, EditVariationPointsRouteProps} from "../../../pages/Specifications/EditVariationPoints";

const store: Store<IStoreState> = createStore(
    rootReducer
);

const history = createBrowserHistory();
const location = createLocation("", "", "", {search: "", pathname: "", hash: "", key: "", state: ""});
const editVariationPointsRouteProps: match<EditVariationPointsRouteProps> = {
    params: {
        specificationId: "056fcfcd-fb12-45ed-8a1b-079a0e2fc8c5",
    },
    isExact: true,
    path: "",
    url: ""
};

store.dispatch = jest.fn();

describe("<EditVariationPoints />", () => {
    it('will have the correct breadcrumbs', () => {
        const wrapper = mount(<MemoryRouter><Provider store={store}><EditVariationPoints match={editVariationPointsRouteProps} history={history} location={location} /></Provider></MemoryRouter>);
        expect(wrapper.find(".govuk-breadcrumbs__list").children().length).toBe(4);
    });

    it('will have the correct <H1 /> title', () => {
        const wrapper = mount(<MemoryRouter><Provider store={store}><EditVariationPoints match={editVariationPointsRouteProps} history={history} location={location} /></Provider></MemoryRouter>);
        expect(wrapper.find(".govuk-fieldset__heading").text()).toBe("Variation occurence");
    });
});