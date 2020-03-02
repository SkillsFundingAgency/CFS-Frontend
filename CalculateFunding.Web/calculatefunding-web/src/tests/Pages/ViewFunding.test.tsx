import React from 'react';
import ViewFundingPage from "../../pages/ViewFunding";
import {FundingPeriod, FundingStream, Specification} from "../../types/viewFundingTypes";
import {FacetsEntity, ProvidersEntity, PublishedProviderItems} from "../../types/publishedProvider";
import {EffectiveSpecificationPermission} from "../../types/EffectiveSpecificationPermission";
import {LoadingStatus} from "../../components/LoadingStatus";

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
const mockGetLatestJobForSpecification = jest.fn();
const mockReleaseFunding = jest.fn();
const mockProviders: ProvidersEntity[] = [];
const mockFacetProviderTypeValues = [{name: "facet provider type value 1", count: 1}, {name: "facet provider type value 2", count: 2}];
const mockFacetLocalAuthorityValues = [{name: "facet local authority value 1", count: 1}, {name: "facet local authority value 2", count: 2}];
const mockFacetStatusTypeValues = [{name: "facet status value 1", count: 1}, {name: "facet status value 2", count: 2}];
const mockFacets: FacetsEntity[] = [
        {
            name: "test provider type facet entity",
            facetValues: mockFacetProviderTypeValues
        },
        {
            name: "test local authority facet entity",
            facetValues: mockFacetLocalAuthorityValues
        },
        {
            name: "test status facet entity",
            facetValues: mockFacetStatusTypeValues
        }
    ];
const mockPublishedProviderResults = {
        canPublish: true,
        canApprove: true,
        currentPage: 123,
        endItemNumber: 123,
        facets: mockFacetProviderTypeValues,
        pagerState: {
            currentPage: 123,
            displayNumberOfPages: 123,
            lastPage: 123,
            nextPage: 123,
            pages: [123],
            previousPage: 123
        },
        providers: mockProviders,
        startItemNumber: 123,
        totalErrorResults: 123,
        totalResults: 123,
        filteredFundingAmount: 123,
        totalFundingAmount: 1474900,
        totalProvidersToApprove: 123,
        totalProvidersToPublish: 123,
    };
const mockSpecifications = {
        name: "TEST SPECIFICATION NAME",
        id: "ABCD",
        templateIds: {
            PSG: ""
        },
        publishedResultsRefreshedAt: null,
        providerVersionId: "",
        lastCalculationUpdatedAt: "",
        fundingStreams:[
                { id:"",
                 name:"TEST SELECTED SPECIFICATION FUNDING STREAM NAME"
                }],
        fundingPeriod: {
            id: "",
            name: "TEST SELECTED SPECIFICATION FUNDING PERIOD NAME"
        },
        isSelectedForFunding: false,
        description: "",
        approvalStatus: ""
    };
const mockJobMessage =
    {
        completionStatus: null,
        invokerUserDisplayName: '',
        invokerUserId: '',
        itemCount: 0,
        jobId: '',
        jobType: '',
        outcome: null,
        overallItemsFailed: 0,
        overallItemsProcessed: 0,
        overallItemsSucceeded: 0,
        parentJobId: 0,
        runningStatus: '',
        specificationId: '',
        statusDateTime: '',
        supersededByJobId: 0
    };
const mockViewFundingPageWithSpecification = <ViewFundingPage getSelectedSpecifications={mockGetSelectedSpecification}
                                                            getAllFundingStreams={mockGetAllFundingStreams}
                                                            getSelectedFundingPeriods={mockGetSelectedFundingPeriods}
                                                            getPublishedProviderResults={mockGetPublishedProviderResults}
                                                            getLatestRefreshDate={mockGetLatestRefreshDate}
                                                            getUserPermissions={mockGetUserPermission}
                                                            getLatestJobForSpecification={mockGetLatestJobForSpecification}
                                                            filterPublishedProviderResults={mockFilterPublishedProviderResults}
                                                            refreshFunding={mockRefreshFunding}
                                                            approveFunding={mockApproveFunding}
                                                            changePageState={mockChangePageState}
                                                            latestRefreshDateResults={""}
                                                            specifications={mockSpecifications}
                                                            fundingStreams={[] as FundingStream[]}
                                                            selectedFundingPeriods={[] as FundingPeriod[]}
                                                            specificationSelected={true}
                                                            publishedProviderResults={mockPublishedProviderResults}
                                                            filterTypes={mockFacets}
                                                            jobId={""}
                                                            refreshFundingJobId={""}
                                                            approveFundingJobId={""}
                                                            pageState={""}
                                                            effectiveSpecificationPermission={{} as EffectiveSpecificationPermission}
                                                            releaseFunding={mockReleaseFunding}
                                                            releaseFundingJobId={""}
                                                            latestJob={mockJobMessage}/>;

it('will show the first screen', () => {
    const wrapper = shallow(<ViewFundingPage getSelectedSpecifications={mockGetSelectedSpecification}
                                             getAllFundingStreams={mockGetAllFundingStreams}
                                             getSelectedFundingPeriods={mockGetSelectedFundingPeriods}
                                             getPublishedProviderResults={mockGetPublishedProviderResults}
                                             getLatestRefreshDate={mockGetLatestRefreshDate}
                                             getUserPermissions={mockGetUserPermission}
                                             getLatestJobForSpecification={mockGetLatestJobForSpecification}
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
                                             releaseFunding={mockReleaseFunding}
                                             releaseFundingJobId={""}
                                             latestJob={mockJobMessage}
    />);

    expect(wrapper.find('#select-funding-stream')).toBeTruthy();
});

it('will shallow mount', () => {
    const wrapper = shallow(mockViewFundingPageWithSpecification);

    let actual = wrapper.find(".govuk-width-container");

    expect(actual.children().find(".govuk-width-container").length).toBe(2);
});

it('will show permission status given a valid specification is selected', () => {
    const wrapper = shallow(mockViewFundingPageWithSpecification);

    let actual = wrapper.find("PermissionStatus");

    expect(actual.length).toBe(1);
});

it('will hide loading status given latest jobs running status is Completed', () => {
    const mockJobMessage =
        {
            completionStatus: null,
            invokerUserDisplayName: '',
            invokerUserId: '',
            itemCount: 0,
            jobId: '',
            jobType: '',
            outcome: null,
            overallItemsFailed: 0,
            overallItemsProcessed: 0,
            overallItemsSucceeded: 0,
            parentJobId: 0,
            runningStatus: 'Completed',
            specificationId: '',
            statusDateTime: '',
            supersededByJobId: 0
        };
    const mockViewFundingPageWithLatestJobCompleted = <ViewFundingPage getSelectedSpecifications={mockGetSelectedSpecification}
                                                                  getAllFundingStreams={mockGetAllFundingStreams}
                                                                  getSelectedFundingPeriods={mockGetSelectedFundingPeriods}
                                                                  getPublishedProviderResults={mockGetPublishedProviderResults}
                                                                  getLatestRefreshDate={mockGetLatestRefreshDate}
                                                                  getUserPermissions={mockGetUserPermission}
                                                                  getLatestJobForSpecification={mockGetLatestJobForSpecification}
                                                                  filterPublishedProviderResults={mockFilterPublishedProviderResults}
                                                                  refreshFunding={mockRefreshFunding}
                                                                  approveFunding={mockApproveFunding}
                                                                  changePageState={mockChangePageState}
                                                                  latestRefreshDateResults={""}
                                                                  specifications={mockSpecifications}
                                                                  fundingStreams={[] as FundingStream[]}
                                                                  selectedFundingPeriods={[] as FundingPeriod[]}
                                                                  specificationSelected={true}
                                                                  publishedProviderResults={mockPublishedProviderResults}
                                                                  filterTypes={mockFacets}
                                                                  jobId={""}
                                                                  refreshFundingJobId={""}
                                                                  approveFundingJobId={""}
                                                                  pageState={""}
                                                                  effectiveSpecificationPermission={{} as EffectiveSpecificationPermission}
                                                                  releaseFunding={mockReleaseFunding}
                                                                  releaseFundingJobId={""}
                                                                  latestJob={mockJobMessage}/>;

    const wrapper = shallow(mockViewFundingPageWithLatestJobCompleted);

    let actual = wrapper.find("LoadingStatus");

    expect(actual.length).toBe(1);
    expect(actual.props().hidden).toBe(true);
});

it('will hide loading status given latest jobs running status is empty', () => {
    const wrapper = shallow(mockViewFundingPageWithSpecification);

    let actual = wrapper.find("LoadingStatus");

    expect(actual.length).toBe(1);
    expect(actual.props().hidden).toBe(true);
});

it('will show loading status given latest jobs running status is not empty and not completed', () => {
    const mockJobMessage =
        {
            completionStatus: null,
            invokerUserDisplayName: '',
            invokerUserId: '',
            itemCount: 0,
            jobId: '',
            jobType: '',
            outcome: null,
            overallItemsFailed: 0,
            overallItemsProcessed: 0,
            overallItemsSucceeded: 0,
            parentJobId: 0,
            runningStatus: 'In Progress',
            specificationId: '',
            statusDateTime: '',
            supersededByJobId: 0
        };
    const mockViewFundingPageWithJobNotCompleted = <ViewFundingPage getSelectedSpecifications={mockGetSelectedSpecification}
                                                                       getAllFundingStreams={mockGetAllFundingStreams}
                                                                       getSelectedFundingPeriods={mockGetSelectedFundingPeriods}
                                                                       getPublishedProviderResults={mockGetPublishedProviderResults}
                                                                       getLatestRefreshDate={mockGetLatestRefreshDate}
                                                                       getUserPermissions={mockGetUserPermission}
                                                                       getLatestJobForSpecification={mockGetLatestJobForSpecification}
                                                                       filterPublishedProviderResults={mockFilterPublishedProviderResults}
                                                                       refreshFunding={mockRefreshFunding}
                                                                       approveFunding={mockApproveFunding}
                                                                       changePageState={mockChangePageState}
                                                                       latestRefreshDateResults={""}
                                                                       specifications={mockSpecifications}
                                                                       fundingStreams={[] as FundingStream[]}
                                                                       selectedFundingPeriods={[] as FundingPeriod[]}
                                                                       specificationSelected={true}
                                                                       publishedProviderResults={mockPublishedProviderResults}
                                                                       filterTypes={mockFacets}
                                                                       jobId={""}
                                                                       refreshFundingJobId={""}
                                                                       approveFundingJobId={""}
                                                                       pageState={""}
                                                                       effectiveSpecificationPermission={{} as EffectiveSpecificationPermission}
                                                                       releaseFunding={mockReleaseFunding}
                                                                       releaseFundingJobId={""}
                                                                       latestJob={mockJobMessage}/>;

    const wrapper = shallow(mockViewFundingPageWithJobNotCompleted);

    let actual = wrapper.find("LoadingStatus");

    expect(actual.length).toBe(1);
    expect(actual.props().hidden).toBe(false);
});

it('will show warning status given a valid specification, page state not IDLE and no jobs in progress', () => {
    const wrapper = shallow(mockViewFundingPageWithSpecification);

    let actual = wrapper.find(".govuk-warning-text__text");

    expect(actual.html()).toContain("Only one funding stream can be approved or released at a time.");
});

it('will show formatted total funding amount with correct value in filter area', () => {
    const wrapper = shallow(mockViewFundingPageWithSpecification);

    let actual = wrapper.find(".viewfunding-filter").find("FormattedNumber");

    expect(actual.props().value).toBe(mockPublishedProviderResults.totalFundingAmount);
});

it('will show formatted total funding amount with correct value in table headers', () => {
    const wrapper = shallow(mockViewFundingPageWithSpecification);

    let actual = wrapper.find(".govuk-table__head").find("FormattedNumber");

    expect(actual.length).toBe(2);
    expect(actual.at(0).props().value).toBe(mockPublishedProviderResults.totalFundingAmount);
    expect(actual.at(1).props().value).toBe(mockPublishedProviderResults.totalFundingAmount);
});

it('will show last refresh date given latestRefreshDateResults information is available', () => {

    const testLatestRefreshDateResults = "1 Jan 2020";
    let mockViewFundingPage = <ViewFundingPage getSelectedSpecifications={mockGetSelectedSpecification}
                                                                  getAllFundingStreams={mockGetAllFundingStreams}
                                                                  getSelectedFundingPeriods={mockGetSelectedFundingPeriods}
                                                                  getPublishedProviderResults={mockGetPublishedProviderResults}
                                                                  getLatestRefreshDate={mockGetLatestRefreshDate}
                                                                  getUserPermissions={mockGetUserPermission}
                                                                  getLatestJobForSpecification={mockGetLatestJobForSpecification}
                                                                  filterPublishedProviderResults={mockFilterPublishedProviderResults}
                                                                  refreshFunding={mockRefreshFunding}
                                                                  approveFunding={mockApproveFunding}
                                                                  changePageState={mockChangePageState}
                                                                  latestRefreshDateResults={testLatestRefreshDateResults}
                                                                  specifications={mockSpecifications}
                                                                  fundingStreams={[] as FundingStream[]}
                                                                  selectedFundingPeriods={[] as FundingPeriod[]}
                                                                  specificationSelected={true}
                                                                  publishedProviderResults={mockPublishedProviderResults}
                                                                  filterTypes={mockFacets}
                                                                  jobId={""}
                                                                  refreshFundingJobId={""}
                                                                  approveFundingJobId={""}
                                                                  pageState={""}
                                                                  effectiveSpecificationPermission={{} as EffectiveSpecificationPermission}
                                                                  releaseFunding={mockReleaseFunding}
                                                                  releaseFundingJobId={""}
                                                                  latestJob={mockJobMessage}/>;

    const wrapper = shallow(mockViewFundingPage);

    expect(wrapper.text()).toContain(`Last refresh on: ${testLatestRefreshDateResults}`);
});

it('will show last refresh not available given latestRefreshDateResults information is not available', () => {
    const wrapper = shallow(mockViewFundingPageWithSpecification);

    expect(wrapper.text()).toContain("Last refresh on: Not Available");
});

it('will show provider type filter with correct options', () => {
    const wrapper = shallow(mockViewFundingPageWithSpecification);

    let actual = wrapper.find("#ProviderType");

    expect(actual.find('option').at(0).text()).toBe("Show all");
    expect(actual.find('option').at(1).text()).toBe(mockFacetProviderTypeValues[0].name);
    expect(actual.find('option').at(2).text()).toBe(mockFacetProviderTypeValues[1].name);
});

it('will show status filter with correct options', () => {
    const wrapper = shallow(mockViewFundingPageWithSpecification);

    let actual = wrapper.find("#Status");

    expect(actual.find('option').at(0).text()).toBe("Show all");
    expect(actual.find('option').at(1).text()).toBe(mockFacetStatusTypeValues[0].name);
    expect(actual.find('option').at(2).text()).toBe(mockFacetStatusTypeValues[1].name);
});

it('will show specification name in page header', () => {
    const wrapper = shallow(mockViewFundingPageWithSpecification);

    let actual = wrapper.find("h1");

    expect(actual.text()).toBe(mockSpecifications.name);
});

it('will show funding period name in page header', () => {
    const wrapper = shallow(mockViewFundingPageWithSpecification);

    let actual = wrapper.find("h2");

    expect(actual.length).toBe(2);
    expect(actual.at(0).text()).toBe(mockSpecifications.fundingPeriod.name);
});

it('will show funding stream name in page header', () => {
    const wrapper = shallow(mockViewFundingPageWithSpecification);

    let actual = wrapper.find("h2");

    expect(actual.length).toBe(2);
    expect(actual.at(1).text()).toBe(mockSpecifications.fundingStreams[0].name);
});

