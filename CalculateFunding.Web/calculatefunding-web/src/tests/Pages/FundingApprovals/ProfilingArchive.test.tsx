import React from 'react';
import {mount} from "enzyme";
import {ProfilingArchive, ProfilingArchiveRouteProps} from "../../../pages/FundingApprovals/ProfilingArchive";
import {match, MemoryRouter} from "react-router";
import {createLocation, createMemoryHistory} from "history";

const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});

const history = createMemoryHistory();
const location = createLocation("","","");
const matchMock : match<ProfilingArchiveRouteProps> = {
    params: {
        specificationId: "ABC123",
        providerVersionId: "123456",
        providerId: "100100"
    },
    path:"",
    isExact: true,
};

describe("<ProfilingArchive />", () => {
    it('will have the correct breadcrumbs', () => {
        const wrapper = mount(<MemoryRouter><ProfilingArchive location={location} history={history} match={matchMock}/></MemoryRouter>);
        expect(wrapper.find(".govuk-breadcrumbs__list").children().length).toBe(5);
    });
});
