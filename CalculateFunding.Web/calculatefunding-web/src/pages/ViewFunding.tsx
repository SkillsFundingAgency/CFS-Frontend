import * as React from "react";
import {Header} from "../components/Header";
import {Banner} from "../components/Banner";
import {Footer} from "../components/Footer";
import {FundingPeriod, FundingStream, Specification} from "../types/viewFundingTypes";
import {FacetsEntity, ProvidersEntity} from "../types/publishedProvider";
import {IBreadcrumbs} from "../types/IBreadcrumbs";
import {NotificationSignal} from "../signals/NotificationSignal";
import {Navigation, NavigationLevel} from "../components/Navigation";
import {BackButton} from "../components/BackButton";
import Pagination from "../components/Pagination";
import {FormattedNumber, NumberType} from "../components/FormattedNumber";
import {EffectiveSpecificationPermission} from "../types/EffectiveSpecificationPermission";
import {PermissionStatus} from "../components/PermissionStatus";
import {LoadingStatus} from "../components/LoadingStatus";


export interface IViewFundingProps {
    getSelectedSpecifications: any;
    getAllFundingStreams: any;
    getSelectedFundingPeriods: any;
    getPublishedProviderResults: any;
    getLatestRefreshDate: any;
    getUserPermissions: any;
    getLatestJobForSpecification: any;
    filterPublishedProviderResults: any;
    refreshFunding: any;
    approveFunding: any;
    releaseFunding: any;
    changePageState: any;
    latestRefreshDateResults: string;
    effectiveSpecificationPermission: EffectiveSpecificationPermission;
    specifications: Specification;
    fundingStreams: FundingStream[];
    selectedFundingPeriods: FundingPeriod[];
    specificationSelected: boolean;
    publishedProviderResults: {
        canPublish: boolean;
        canApprove: boolean
        currentPage: number,
        endItemNumber: number,
        facets: FacetsEntity[],
        pagerState: {
            currentPage: number,
            displayNumberOfPages: number,
            lastPage: number,
            nextPage: number,
            pages: number[],
            previousPage: number
        },
        providers: ProvidersEntity[],
        startItemNumber: number,
        totalErrorResults: number,
        totalResults: number,
        filteredFundingAmount: number,
        totalFundingAmount: number,
        totalProvidersToApprove: number,
        totalProvidersToPublish: number,
    };
    filterTypes: FacetsEntity[];
    jobId: string;
    refreshFundingJobId: string;
    approveFundingJobId: string;
    releaseFundingJobId: string;
    pageState: string;
    jobCurrentlyInProgress: string;
}

export default class ViewFundingPage extends React.Component<IViewFundingProps, {}> {
    componentDidMount(): void {
        this.props.getAllFundingStreams();
        document.title = "Approve and release funding - Calculate Funding";
    }

    state = {
        fundingPeriod: "",
        fundingStream: "",
        specification: "",
        providerType: "",
        localAuthority: "",
        status: "",
        pageSize: 50,
        jobId: ""
    };

    selectedCount = () => {
        if (this.props.publishedProviderResults.facets != null) {
            if (this.props.publishedProviderResults.facets[2] != null && this.props.publishedProviderResults.facets[2].facetValues.length > 0) {
                return this.props.publishedProviderResults.facets[2].facetValues.length
            }
        }
        return 0;
    };

    getSpecifications = (event: React.ChangeEvent<HTMLSelectElement>) => {
        this.props.getSelectedSpecifications(event.target.value, this.state.fundingStream);
        this.setState({fundingPeriod: event.target.value});
    };

    getFundingPeriods = (event: React.ChangeEvent<HTMLSelectElement>) => {
        this.props.getSelectedFundingPeriods(event.target.value);
        this.setState({fundingStream: event.target.value})
    };

    selectedSpecification = (event: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({specification: event.target.value});
    };

    viewFunding = (event: React.FormEvent) => {
        this.props.getPublishedProviderResults(this.state.fundingPeriod, this.state.fundingStream, this.state.specification);
        this.props.getLatestJobForSpecification(this.props.specifications.id);
    };

    filterLocalAuthority = (event: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({localAuthority: event.target.value});
        this.props.filterPublishedProviderResults(this.state.fundingPeriod, this.state.fundingStream, this.state.specification, this.state.providerType, event.target.value, this.state.status, 1, this.state.pageSize);
    };

    filterStatus = (event: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({status: event.target.value});
        this.props.filterPublishedProviderResults(this.state.fundingPeriod, this.state.fundingStream, this.state.specification, this.state.providerType, this.state.localAuthority, event.target.value, 1, this.state.pageSize);
    };

    filterProviderType = (event: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({providerType: event.target.value});
        this.props.filterPublishedProviderResults(this.state.fundingPeriod, this.state.fundingStream, this.state.specification, event.target.value, this.state.localAuthority, this.state.status, 1, this.state.pageSize);
    };

    changePageSize = (event: React.ChangeEvent<HTMLSelectElement>) => {
        let pageSize = parseInt(event.target.value);
        this.setState({pageSize: pageSize});

        this.props.filterPublishedProviderResults(this.state.fundingPeriod, this.state.fundingStream, this.state.specification, this.state.providerType, this.state.localAuthority, this.state.status, 1, pageSize);
    };

    refreshFunding = () => {
        this.props.changePageState("REFRESH_FUNDING");
        this.props.refreshFunding(this.props.specifications.id)
    };

    approveFunding = () => {
        this.props.changePageState("APPROVE_FUNDING");
    };

    releaseFunding = () => {
        this.props.changePageState("PUBLISH_FUNDING");
    };

    confirmApproveFunding = () => {
        this.props.changePageState("APPROVE_FUNDING_JOB");
        this.props.approveFunding(this.props.specifications.id);
    };

    confirmReleaseFunding = () => {
        this.props.changePageState("RELEASE_FUNDING_JOB");
        this.props.releaseFunding(this.props.specifications.id);
    };

    refreshProviderResults = () => {
        this.props.getPublishedProviderResults(this.state.fundingPeriod, this.state.fundingStream, this.state.specification);
        this.props.changePageState("IDLE");
    };

    movePage = (pageNumber: string) => {
        this.props.filterPublishedProviderResults(this.state.fundingPeriod, this.state.fundingStream, this.state.specification, this.state.providerType, this.state.localAuthority, this.state.status, pageNumber, this.state.pageSize);
    };

    dismissLoader = () => {
        this.props.changePageState("IDLE");
    };


    render() {
        let breadcrumbs: IBreadcrumbs[] = [
            {
                url: "/",
                name: "Calculate Funding"
            },
            {
                url: "/approvals",
                name: "Funding Approvals"
            },
            {
                url: null,
                name: "Approve and release funding"
            }];

        let lastRefreshDate = "Not Available";
        if (this.props.specifications.id != null && this.props.specifications.id.length > 0) {
            this.props.getLatestRefreshDate(this.props.specifications.id);
            if (this.props.effectiveSpecificationPermission.specificationId === "")
                this.props.getUserPermissions(this.props.specifications.id);
            if (this.props.latestRefreshDateResults.length > 0)
                lastRefreshDate = this.props.latestRefreshDateResults
        }


        let missingPermissions= [];
        if (!this.props.effectiveSpecificationPermission.canApproveFunding)
        {
            missingPermissions.push("approve");
        }
        if (!this.props.effectiveSpecificationPermission.canReleaseFunding)
        {
            missingPermissions.push("release");
        }
        if (!this.props.effectiveSpecificationPermission.canRefreshFunding)
        {
            missingPermissions.push("refresh");
        }

        if (!this.props.specificationSelected) {
            return <div>
                <Header/>
                <div className="govuk-width-container">
                    <Navigation currentNavigationLevel={NavigationLevel.FundingApproval}/>
                    <Banner bannerType="Left" breadcrumbs={breadcrumbs} title="Approve and release funding"
                            subtitle="You can approve and release funding for payment for completed specifications"/>
                    <div className="govuk-main-wrapper govuk-main-wrapper--l"
                          hidden={this.props.specificationSelected}>

                        <fieldset className="govuk-fieldset">
                            <div className="govuk-form-group">
                                <label htmlFor="select-funding-stream" className="govuk-label">Select
                                    funding
                                    stream:</label>
                                <select id="select-funding-stream" className="govuk-select"
                                        disabled={this.props.fundingStreams.length === 0} onChange={(e) => {
                                    this.getFundingPeriods(e)
                                }}>
                                    <option>Please select a funding stream</option>
                                    {this.props.fundingStreams.map(fs =>
                                        <option key={fs.id} value={fs.id}>{fs.name}</option>
                                    )}
                                </select></div>
                        </fieldset>
                        <fieldset className="govuk-fieldset">
                            <div className="govuk-form-group">
                                <label htmlFor="select-provider" className="govuk-label">Select funding
                                    period:</label>
                                <select id="select-provider" className="govuk-select" placeholder="Please select"
                                        disabled={this.props.selectedFundingPeriods.length === 0}
                                        onChange={(e) => {
                                            this.getSpecifications(e)
                                        }}>
                                    <option>Please select a funding period</option>
                                    {this.props.selectedFundingPeriods.map(fp =>
                                        <option key={fp.id} value={fp.id}>{fp.name}</option>
                                    )}
                                </select>
                            </div>
                        </fieldset>
                        <fieldset className="govuk-fieldset">
                            <div className="govuk-form-group" hidden={this.props.specifications.name === ""}>
                                <label htmlFor="select-provider"
                                       className="govuk-label">Specification:</label>
                                <input className="govuk-input" type="text" disabled={true}
                                       value={this.props.specifications.name}/>
                            </div>
                        </fieldset>
                        <div className="row">
                            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                <div className="form-group">
                                    <button className="govuk-button" data-module="govuk-button"
                                            onClick={(e) => this.viewFunding(e)}
                                            disabled={this.props.specifications.id === ""}>View
                                        Funding
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer/>
            </div>;
        }
        if (this.props.specificationSelected) {
            return <div>
                <Header/>
                <Navigation currentNavigationLevel={NavigationLevel.FundingApproval}/>
                <div className="govuk-width-container">
                    <Banner bannerType="Left" breadcrumbs={breadcrumbs} title="Approve and release funding"
                            subtitle="You can approve and release funding for payment for completed specifications"/>
                    <PermissionStatus requiredPermissions={missingPermissions} />
                    <LoadingStatus title={`${this.props.jobCurrentlyInProgress} of funding in progress`}
                                   subTitle={"Please wait, this could take several minutes"}
                                   hidden={this.props.jobCurrentlyInProgress === ''} />
                    <div className="container" hidden={this.props.pageState !== "IDLE" || this.props.jobCurrentlyInProgress !== ''}>

                        <div className="govuk-warning-text">
                            <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
                            <strong className="govuk-warning-text__text">
                                <span className="govuk-warning-text__assistive">Warning</span>
                                Only one funding stream can be
                                approved
                                or
                                released at a time.
                            </strong>
                        </div>
                        <div className="govuk-grid-row viewfunding-filter">
                            <div className="govuk-grid-column-one-quarter">
                                <label className="govuk-label" htmlFor="ProviderType">Provider Type</label>
                                <select className="govuk-select" name="ProviderType" id="ProviderType"
                                        onChange={(e) => {
                                            this.filterProviderType(e)
                                        }}>
                                    <option value="">Show all</option>
                                    {this.props.filterTypes[0].facetValues.map(facet =>
                                        <option key={facet.name}>{facet.name}</option>
                                    )}
                                </select>
                            </div>
                            <div className="govuk-grid-column-one-quarter">
                                <label className="govuk-label" htmlFor="LocalAuthority">Local Authority</label>
                                <select className="govuk-select" name="LocalAuthority" id="LocalAuthority"
                                        onChange={(e) => {
                                            this.filterLocalAuthority(e)
                                        }}>
                                    <option value="">Show all</option>
                                    {this.props.filterTypes[1].facetValues.map(facet =>
                                        <option key={facet.name}>{facet.name}</option>
                                    )}
                                </select>
                            </div>
                            <div className="govuk-grid-column-one-quarter">
                                <label className="govuk-label" htmlFor="Status">Status</label>
                                <select className="govuk-select" name="Status" id="Status" onChange={(e) => {
                                    this.filterStatus(e)
                                }}>
                                    <option value="">Show all</option>
                                    {this.props.filterTypes[2].facetValues.map(facet =>
                                        <option key={facet.name}>{facet.name}</option>
                                    )}
                                </select>
                            </div>
                            <div className="govuk-grid-column-one-quarter">
                                <span className="govuk-body">Funding Total</span>
                                <p className="govuk-body govuk-!-font-size-27 govuk-!-font-weight-bold govuk-!-margin-bottom-0">
                                    <FormattedNumber value={this.props.publishedProviderResults.totalFundingAmount} type={NumberType.FormattedMoney} decimalPoint={2}/>
                                </p>
                            </div>
                        </div>
                        <div className="govuk-grid-row govuk-!-margin-top-5 govuk-!-margin-bottom-5">
                            <div className="govuk-grid-column-full">
                                <p className="govuk-body govuk-!-display-inline">Showing</p>
                                <select className="govuk-select govuk-!-margin-left-1 govuk-!-margin-right-1" name="viewFundingPageSize"
                                        id="viewFundingPageSize" onChange={(e) => {
                                    this.changePageSize(e)
                                }} hidden={this.props.publishedProviderResults.totalResults > 49}>
                                    <option
                                        value={this.props.publishedProviderResults.totalResults}>{this.props.publishedProviderResults.totalResults}</option>
                                </select>
                                <select className="govuk-select govuk-!-margin-left-1 govuk-!-margin-right-1" name="viewFundingPageSize"
                                        id="viewFundingPageSize" onChange={(e) => {
                                    this.changePageSize(e)
                                }} hidden={this.props.publishedProviderResults.totalResults < 50}>
                                    <option value="50">50</option>
                                    <option value="100"
                                            hidden={this.props.publishedProviderResults.totalResults < 100}>100
                                    </option>
                                    <option value="200"
                                            hidden={this.props.publishedProviderResults.totalResults < 200}>200
                                    </option>
                                </select>
                                <p className="govuk-body govuk-!-display-inline">of {this.props.publishedProviderResults.totalResults}</p>
                            </div>
                        </div>

                        <div id="govuk-grid-row">
                            <div className="govuk-grid-column-full">
                                <table className="govuk-table">
                                    <thead className="govuk-table__head">
                                    <tr className="govuk-table__row">
                                        <td className="govuk-table__header">Provider name</td>
                                        <td className="govuk-table__header">UKPRN</td>
                                        <td className="govuk-table__header">Status</td>
                                        <td className="govuk-table__header">Funding total</td>
                                    </tr>
                                    </thead>
                                    <tbody className="govuk-table__body">
                                    {this.props.publishedProviderResults.providers.map(fp =>
                                        <tr className="govuk-table__body" key={fp.id}>
                                            <td className="govuk-table__cell"><a href={"/app/FundingApprovals/ProviderFundingOverview/" + fp.specificationId + "/" + fp.ukprn + "/" + this.props.specifications.providerVersionId}>{fp.providerName}</a></td>
                                            <td className="govuk-table__cell">{fp.ukprn}</td>
                                            <td className="govuk-table__cell">{fp.fundingStatus}</td>
                                            <td className="govuk-table__cell">
                                                <FormattedNumber value={fp.fundingValue} type={NumberType.FormattedMoney} decimalPoint={2}/>
                                            </td>
                                        </tr>
                                    )}

                                    </tbody>
                                    <tbody hidden={this.selectedCount() > 0}>
                                    <tr>
                                        <td colSpan={4}>
                                            There are no records available for the selected specification
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="govuk-grid-row">
                            <div className="govuk-grid-column-full">
                                <Pagination currentPage={this.props.publishedProviderResults.pagerState.currentPage} lastPage={this.props.publishedProviderResults.pagerState.lastPage} callback={this.movePage}/>
                            </div>
                        </div>
                        <div className="govuk-grid-row">
                            <div className="govuk-grid-column-full">
                                <button className="govuk-button govuk-!-margin-right-1"
                                        disabled={!this.props.publishedProviderResults.canApprove || !this.props.effectiveSpecificationPermission.canApproveFunding}
                                        onClick={() => this.approveFunding()}>Approve
                                </button>
                                <button className="govuk-button govuk-!-margin-right-1"
                                        disabled={!this.props.publishedProviderResults.canPublish || !this.props.effectiveSpecificationPermission.canReleaseFunding}
                                        onClick={() => this.releaseFunding()}>Release
                                </button>
                                <button className="govuk-button"
                                        disabled={!this.props.effectiveSpecificationPermission.canRefreshFunding}
                                        onClick={() => this.refreshFunding()}>Refresh
                                    funding
                                </button>
                                <p className="govuk-body">Last refresh on: {lastRefreshDate}</p>
                            </div>
                        </div>
                    </div>
                    <div className="govuk-width-container" hidden={this.props.pageState !== "APPROVE_FUNDING"  || this.props.jobCurrentlyInProgress !== ''}>
                        <div className="govuk-grid-row">
                            <div className="govuk-grid-column-full">
                                <BackButton name="Back" callback={this.dismissLoader} />
                            </div>
                        </div>

                        <div className="govuk-grid-row">
                            <div className="govuk-grid-column-full">
                                <table className="govuk-table">
                                    <caption className="govuk-table__caption">You have selected:</caption>
                                    <thead className="govuk-table__head">
                                    <tr className="govuk-table__row">
                                        <th className="govuk-table__header">Item</th>
                                        <th className="govuk-table__header">Total</th>
                                    </tr>
                                    </thead>
                                    <tbody className="govuk-table__body">
                                    <tr className="govuk-table__row">
                                        <td className="govuk-table__header">Number of providers to approve</td>
                                        <td className="govuk-table__cell">{this.props.publishedProviderResults.totalProvidersToApprove}</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="govuk-grid-row">
                            <div className="govuk-grid-column-full">
                                <table className="govuk-table">
                                    <thead className="govuk-table__head">
                                    <tr className="govuk-table__row">
                                        <th className="govuk-table__header">Specification Details</th>
                                        <th className="govuk-table__header">Info</th>
                                        <th className="govuk-table__header">Funding</th>
                                    </tr>
                                    </thead>
                                    <tbody className="govuk-table__body">
                                    <tr className="govuk-table__row">
                                        <td className="govuk-table__cell">Funding Period</td>
                                        <td className="govuk-table__cell">{this.props.specifications.fundingPeriod.name}</td>
                                        <td className="govuk-table__cell"></td>
                                    </tr>
                                    <tr>
                                        <td className="govuk-table__cell">Specification selected</td>
                                        <td className="govuk-table__cell">{this.props.specifications.name}</td>
                                        <td className="govuk-table__cell"></td>
                                    </tr>
                                    <tr>
                                        <td className="govuk-table__cell">Funding Stream</td>
                                        <td className="govuk-table__cell">{this.props.specifications.fundingStreams.map(stream =>
                                            stream.name
                                        )}</td>
                                        <td className="govuk-table__cell"></td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="govuk-grid-row">
                            <div className="govuk-grid-column-full">
                                <table className="govuk-table">
                                    <thead className="govuk-table__head">
                                    <tr className="govuk-table__row">
                                        <th className="govuk-table__header">Total funding being approved</th>
                                        <th className="govuk-table__header"></th>
                                        <th className="govuk-table__header">
                                            <FormattedNumber value={this.props.publishedProviderResults.totalFundingAmount} type={NumberType.FormattedMoney} decimalPoint={2}/>
                                        </th>
                                    </tr>
                                    </thead>
                                </table>
                            </div>
                        </div>
                        <div className="govuk-grid-row">
                            <div className="govuk-grid-column-full">
                                <button className="govuk-button" data-module="govuk-button" onClick={() => this.confirmApproveFunding()}>Confirm Approval</button>
                            </div>
                        </div>
                    </div>
                    <main className="govuk-width-container" hidden={this.props.pageState !== "PUBLISH_FUNDING"  || this.props.jobCurrentlyInProgress !== ''}>
                        <div className="govuk-grid-row">
                            <div className="govuk-grid-column-full">
                                <BackButton name="Back" callback={this.dismissLoader} />
                            </div>
                        </div>
                        <div className="govuk-grid-row">
                            <div className="govuk-grid-column-full">
                                <table className="govuk-table">
                                    <caption className="govuk-table__caption">You have selected:</caption>
                                    <thead className="govuk-table__head">
                                    <tr className="govuk-table__row">
                                        <th className="govuk-table__header">Item</th>
                                        <th className="govuk-table__header">Total</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr className="govuk-table__row">
                                        <td className="govuk-table__header">Number of providers to release</td>
                                        <td className="govuk-table__cell">{this.props.publishedProviderResults.totalProvidersToPublish}</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="govuk-grid-row">
                            <div className="govuk-grid-column-full">
                                <table className="govuk-table">
                                    <thead className="govuk-table__head">
                                    <tr className="govuk-table__row">
                                        <th className="govuk-table__header">Specification Details</th>
                                        <th className="govuk-table__header">Info</th>
                                        <th className="govuk-table__header">Funding</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr className="govuk-table__row">
                                        <td className="govuk-table__header">Funding Period</td>
                                        <td className="govuk-table__cell">{this.props.specifications.fundingPeriod.name}</td>
                                        <td className="govuk-table__cell"></td>
                                    </tr>
                                    <tr className="govuk-table__row">
                                        <td className="govuk-table__header">Specification selected</td>
                                        <td className="govuk-table__cell">{this.props.specifications.name}</td>
                                        <td className="govuk-table__cell"></td>
                                    </tr>
                                    <tr className="govuk-table__row">
                                        <td className="govuk-table__header">Funding Stream</td>
                                        <td className="govuk-table__cell">{this.props.specifications.fundingStreams.map(stream =>
                                            stream.name
                                        )}</td>
                                        <td className="govuk-table__cell"></td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="govuk-grid-row">
                            <div className="govuk-grid-column-full">
                                <table className="govuk-table">
                                    <thead className="govuk-table__head">
                                    <tr className="govuk-table__row">
                                        <th className="govuk-table__head">Total funding being released</th>
                                        <th className="govuk-table__head"></th>
                                        <th className="govuk-table__head">
                                            <FormattedNumber value={this.props.publishedProviderResults.totalFundingAmount} type={NumberType.FormattedMoney} decimalPoint={2}/>
                                        </th>
                                    </tr>
                                    </thead>
                                </table>
                            </div>
                        </div>
                        <div className="govuk-grid-row">
                            <div className="govuk-grid-column-full">
                                <button className="govuk-button" data-module="govuk-button"
                                        onClick={() => this.confirmReleaseFunding()}>Confirm Release
                                </button>

                            </div>
                        </div>
                    </main>

                    <div className="container" hidden={this.props.pageState !== "REFRESH_FUNDING"  || this.props.jobCurrentlyInProgress !== ''}>
                        <BackButton name="Back" callback={this.dismissLoader} />
                        <NotificationSignal jobType="RefreshFundingJob"
                                            jobId={this.props.pageState === "REFRESH_FUNDING" ? this.props.specifications.id : ""}
                                            message="Waiting to refresh funding" callback={this.refreshProviderResults}/>
                    </div>
                    <div className="container" hidden={this.props.pageState !== "APPROVE_FUNDING_JOB"  || this.props.jobCurrentlyInProgress !== ''}>
                        <BackButton name="Back" callback={this.dismissLoader} />
                        <NotificationSignal jobType="ApproveFunding"
                                            jobId={this.props.pageState === "APPROVE_FUNDING_JOB" ? this.props.specifications.id : ""}
                                            message="Waiting to approve funding" callback={this.refreshProviderResults}/>
                    </div>
                    <div className="container" hidden={this.props.pageState !== "RELEASE_FUNDING_JOB"  || this.props.jobCurrentlyInProgress !== ''}>
                        <BackButton name="Back" callback={this.dismissLoader} />
                        <NotificationSignal jobType="PublishProviderFundingJob"
                                            jobId={this.props.pageState === "RELEASE_FUNDING_JOB" ? this.props.specifications.id : ""}
                                            message="Waiting to release funding" callback={this.refreshProviderResults}/>
                    </div>
                </div>
                <Footer/>
            </div>;
        }
    }
}

