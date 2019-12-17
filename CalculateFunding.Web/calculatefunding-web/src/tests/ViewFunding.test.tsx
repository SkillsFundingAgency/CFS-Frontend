import React from 'react';
import ViewFundingPage from "../pages/ViewFunding";
import {FundingPeriod, FundingStream, Specification} from "../types/viewFundingTypes";
import {FacetsEntity, PublishedProviderItems} from "../types/publishedProvider";

const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});
const {shallow} = enzyme;


it('will shallow mount', () => {
    const mockGetSelectedSpecification = jest.fn();
    const mockGetAllFundingStreams = jest.fn();
    const mockGetSelectedFundingPeriods = jest.fn();
    const mockGetPublishedProviderResults = jest.fn();
    const mockGetLatestRefreshDate = jest.fn();
    const mockFilterPublishedProviderResults = jest.fn();
    const mockRefreshFunding = jest.fn();
    const mockApproveFunding = jest.fn();
    const mockPublishFunding = jest.fn();
    const mockChangePageState = jest.fn();

    const wrapper = shallow(<ViewFundingPage getSelectedSpecifications={mockGetSelectedSpecification}
                                             getAllFundingStreams={mockGetAllFundingStreams}
                                             getSelectedFundingPeriods={mockGetSelectedFundingPeriods}
                                             getPublishedProviderResults={mockGetPublishedProviderResults}
                                             getLatestRefreshDate={mockGetLatestRefreshDate}
                                             filterPublishedProviderResults={mockFilterPublishedProviderResults}
                                             refreshFunding={mockRefreshFunding}
                                             approveFunding={mockApproveFunding}
                                             publishFunding={mockPublishFunding}
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
                                             publishFundingJobId={""}
                                             pageState={""}/>);
    expect(wrapper.find('div.govuk-width-container'));
});

it('will show the first screen', () => {
    const mockGetSelectedSpecification = jest.fn();
    const mockGetAllFundingStreams = jest.fn();
    const mockGetSelectedFundingPeriods = jest.fn();
    const mockGetPublishedProviderResults = jest.fn();
    const mockGetLatestRefreshDate = jest.fn();
    const mockFilterPublishedProviderResults = jest.fn();
    const mockRefreshFunding = jest.fn();
    const mockApproveFunding = jest.fn();
    const mockPublishFunding = jest.fn();
    const mockChangePageState = jest.fn();

    const wrapper = shallow(<ViewFundingPage getSelectedSpecifications={mockGetSelectedSpecification}
                                             getAllFundingStreams={mockGetAllFundingStreams}
                                             getSelectedFundingPeriods={mockGetSelectedFundingPeriods}
                                             getPublishedProviderResults={mockGetPublishedProviderResults}
                                             getLatestRefreshDate={mockGetLatestRefreshDate}
                                             filterPublishedProviderResults={mockFilterPublishedProviderResults}
                                             refreshFunding={mockRefreshFunding}
                                             approveFunding={mockApproveFunding}
                                             publishFunding={mockPublishFunding}
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
                                             publishFundingJobId={""}
                                             pageState={""}/>);

    expect(wrapper.find('#select-funding-stream')).toBeTruthy();
});