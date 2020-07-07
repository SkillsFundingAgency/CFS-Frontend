import React from 'react';
import {mount} from "enzyme";
import {match, MemoryRouter} from "react-router";
import {
    ViewProvidersByFundingStream,
    ViewProvidersByFundingStreamRouteProps
} from "../../../pages/ViewResults/ViewProvidersByFundingStream";
import {createLocation, createMemoryHistory} from "history";
const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});
const history = createMemoryHistory();
const location = createLocation("","","");
const matchMock : match<ViewProvidersByFundingStreamRouteProps> = {
    params: {
        fundingStreamId: "123"
    },
    path:"",
    isExact: true,
    url: ""
};
describe("<ViewProvidersByFundingStream />", () => {
    it('will render the page', () => {
        const wrapper = mount(<MemoryRouter><ViewProvidersByFundingStream match={matchMock} location={location} history={history} /></MemoryRouter>);

        expect(wrapper.find(".govuk-width-container").length).toBe(3);
        expect(wrapper.find('#searchProviders')).toBeTruthy();
        expect(wrapper.find('.govuk-form-group').length).toBe(4);
        expect(wrapper.find('h1').text()).toBe("View provider results");
    });

    it('will have the correct breadcrumbs', () => {
        const wrapper = mount(<MemoryRouter><ViewProvidersByFundingStream match={matchMock} location={location} history={history} /></MemoryRouter>);
        expect(wrapper.find(".govuk-breadcrumbs__list").children().length).toBe(4);
    });
});