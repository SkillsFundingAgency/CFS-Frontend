import React from 'react';
import {mount} from "enzyme";
import {match, MemoryRouter} from "react-router";
import {createLocation, createMemoryHistory} from "history";
import {ViewProviderResults, ViewProviderResultsRouteProps} from "../../../pages/ViewResults/ViewProviderResults";
const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});
const history = createMemoryHistory();
const location = createLocation("","","");
const matchMock : match<ViewProviderResultsRouteProps> = {
    params: {
        providerId: "123"
    },
    path:"",
    isExact: true,
    url: ""
};
describe("<ViewProviderResults />", () => {
    it('will render the page', () => {
        const wrapper = mount(<MemoryRouter><ViewProviderResults match={matchMock} location={location} history={history} /></MemoryRouter>);

        expect(wrapper.find('#searchProviders')).toBeTruthy();
        expect(wrapper.find('.govuk-form-group').length).toBe(3);
    });

    it('will have the correct breadcrumbs', () => {
        const wrapper = mount(<MemoryRouter><ViewProviderResults match={matchMock} location={location} history={history} /></MemoryRouter>);
        expect(wrapper.find(".govuk-breadcrumbs__list").children().length).toBe(5);
    });
});