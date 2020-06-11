import React from 'react';
import {mount} from "enzyme";
import {match, MemoryRouter} from "react-router";
import {FundingApprovalResults, FundingApprovalResultsRoute} from "../../../pages/FundingApprovals/FundingApprovalResults";
import {createLocation, createMemoryHistory} from "history";
import {DatasetHistoryRouteProps} from "../../../pages/Datasets/DatasetHistory";
import {Provider} from "react-redux";
import {ManageData} from "../../../pages/Datasets/ManageData";

const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});

const history = createMemoryHistory();
const location = createLocation("","","");
const matchMock : match<FundingApprovalResultsRoute> = {
    params: {
        specificationId: "ABC123",
        fundingStreamId: "FS123",
        fundingPeriodId: "FP123"
    },
    path:"",
    isExact: true,
};

describe("<FundingApprovalResults />", () => {
    it('will have the correct breadcrumbs', () => {
        const wrapper = mount(<MemoryRouter><FundingApprovalResults location={location} history={history} match={matchMock} /></MemoryRouter>);
        expect(wrapper.find(".govuk-breadcrumbs__list").children().length).toBe(4);
    });

    it('will have the correct Specifications title', () => {
        const wrapper = mount(<MemoryRouter><FundingApprovalResults location={location} history={history} match={matchMock} /></MemoryRouter>);
        expect(wrapper.find("span.govuk-caption-xl").text()).toBe("Specification");
    });

    it('will have the correct Funding Period title for Funding Approval results', () => {
        const wrapper = mount(<MemoryRouter><FundingApprovalResults location={location} history={history} match={matchMock} /></MemoryRouter>);
        expect(wrapper.find("span.govuk-caption-m").at(0).text()).toBe("Funding period");
    });

    it('will have the correct Funding Stream title for Funding Approval results', () => {
        const wrapper = mount(<MemoryRouter><FundingApprovalResults location={location} history={history} match={matchMock} /></MemoryRouter>);
        expect(wrapper.find("span.govuk-caption-m").at(1).text()).toBe("Funding stream");
    });

    it('will have the correct Provider name title on the table', () => {
        const wrapper = mount(<MemoryRouter><FundingApprovalResults location={location} history={history} match={matchMock} /></MemoryRouter>);
        expect(wrapper.find("table").at(0).find("tr").at(0).find("th").at(0).text()).toBe("Provider name");
    });

    it('will have the correct UKPRN name title on the table', () => {
        const wrapper = mount(<MemoryRouter><FundingApprovalResults location={location} history={history} match={matchMock} /></MemoryRouter>);
        expect(wrapper.find("table").at(0).find("tr").at(0).find("th").at(1).text()).toBe("UKPRN");
    });

    it('will have the correct Status name title on the table', () => {
        const wrapper = mount(<MemoryRouter><FundingApprovalResults location={location} history={history} match={matchMock} /></MemoryRouter>);
        expect(wrapper.find("table").at(0).find("tr").at(0).find("th").at(2).text()).toBe("Status");
    });
});