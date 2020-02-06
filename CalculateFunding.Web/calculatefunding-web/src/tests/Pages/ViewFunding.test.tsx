import React from 'react';
import ViewFundingPage from "../../pages/ViewFunding";
import {FundingPeriod, FundingStream, Specification} from "../../types/viewFundingTypes";
import {FacetsEntity, PublishedProviderItems} from "../../types/publishedProvider";
import {EffectiveSpecificationPermission} from "../../types/EffectiveSpecificationPermission";

const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});
const {shallow} = enzyme;
const mockGetSelectedSpecification = jest.fn();
const mockGetAllFundingStreams = jest.fn();
const mockGetSelectedFundingPeriods = jest.fn();
const mockGetPublishedProviderResults = jest.fn();
const mockGetLatestRefreshDate = jest.fn();
const mockFilterPublishedProviderResults = jest.fn();
const mockRefreshFunding = jest.fn();
const mockApproveFunding = jest.fn();
const mockChangePageState = jest.fn();
const mockGetUserPermission = jest.fn();
const mockReleaseFunding = jest.fn();

it('will shallow mount', () => {
    const wrapper = shallow(<ViewFundingPage getSelectedSpecifications={mockGetSelectedSpecification}
                                             getAllFundingStreams={mockGetAllFundingStreams}
                                             getSelectedFundingPeriods={mockGetSelectedFundingPeriods}
                                             getPublishedProviderResults={mockGetPublishedProviderResults}
                                             getLatestRefreshDate={mockGetLatestRefreshDate}
                                             filterPublishedProviderResults={mockFilterPublishedProviderResults}
                                             refreshFunding={mockRefreshFunding}
                                             approveFunding={mockApproveFunding}
                                             changePageState={mockChangePageState}
                                             latestRefreshDateResults={""}
                                             specifications={{} as Specification}
                                             fundingStreams={[] as FundingStream[]}
                                             selectedFundingPeriods={[] as FundingPeriod[]}
                                             specificationSelected={false}
                                             publishedProviderResults={{} as PublishedProviderItems}
                                             filterTypes={[] as FacetsEntity[]}
                                             jobId={""}
                                             refreshFundingJobId={""}
                                             approveFundingJobId={""}
                                             pageState={""}
                                             effectiveSpecificationPermission={{} as EffectiveSpecificationPermission}
                                             getUserPermissions={mockGetUserPermission}
                                             releaseFunding={mockReleaseFunding}
                                             releaseFundingJobId={""}/>);
    expect(wrapper.find('div.govuk-width-container'));
});

it('will show the first screen', () => {
    const wrapper = shallow(<ViewFundingPage getSelectedSpecifications={mockGetSelectedSpecification}
                                             getAllFundingStreams={mockGetAllFundingStreams}
                                             getSelectedFundingPeriods={mockGetSelectedFundingPeriods}
                                             getPublishedProviderResults={mockGetPublishedProviderResults}
                                             getLatestRefreshDate={mockGetLatestRefreshDate}
                                             filterPublishedProviderResults={mockFilterPublishedProviderResults}
                                             refreshFunding={mockRefreshFunding}
                                             approveFunding={mockApproveFunding}
                                             changePageState={mockChangePageState}
                                             latestRefreshDateResults={""}
                                             specifications={{} as Specification}
                                             fundingStreams={[] as FundingStream[]}
                                             selectedFundingPeriods={[] as FundingPeriod[]}
                                             specificationSelected={false}
                                             publishedProviderResults={{} as PublishedProviderItems}
                                             filterTypes={[] as FacetsEntity[]}
                                             jobId={""}
                                             refreshFundingJobId={""}
                                             approveFundingJobId={""}
                                             pageState={""}
                                             effectiveSpecificationPermission={{} as EffectiveSpecificationPermission}
                                             getUserPermissions={mockGetUserPermission}
                                             releaseFunding={mockReleaseFunding}
                                             releaseFundingJobId={""}
    />);

    expect(wrapper.find('#select-funding-stream')).toBeTruthy();
});