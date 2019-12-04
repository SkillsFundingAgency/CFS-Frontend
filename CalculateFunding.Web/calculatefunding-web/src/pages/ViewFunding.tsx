import * as React from "react";
import {Header} from "../components/Header";
import {Banner} from "../components/Banner";
import {Footer} from "../components/Footer";
import {FundingPeriod, FundingStream, Specification} from "../types/viewFundingTypes";
import {FacetsEntity, ProvidersEntity} from "../types/publishedProvider";
import {IBreadcrumbs} from "../types/IBreadcrumbs";
import {NotificationSignal} from "../signals/NotificationSignal";
import {Navigation, NavigationLevel} from "../components/Navigation";

export interface IViewFundingProps {
    getSelectedSpecifications: any;
    getAllFundingStreams: any;
    getSelectedFundingPeriods: any;
    getPublishedProviderResults: any;
    filterPublishedProviderResults: any;
    refreshFunding: any;
    approveFunding: any;
    publishFunding: any;
    changePageState: any;
    specifications: Specification;
    fundingStreams: FundingStream[];
    selectedFundingPeriods: FundingPeriod[];
    specificationSelected: boolean;
    publishedProviderResults: {
        canPublish: boolean;
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
        filteredFundingAmount: number
    };
    filterTypes: FacetsEntity[];
    jobId: string;
    refreshFundingJobId: string;
    approveFundingJobId: string;
    publishFundingJobId: string;
    pageState: string;
}

export default class ViewFundingPage extends React.Component<IViewFundingProps, {}> {
    componentDidMount(): void {
        this.props.getAllFundingStreams();
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


    getSpecifications = (event: React.ChangeEvent<HTMLSelectElement>) => {
        console.log(event);
        console.log(event.target.value);
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
        console.log(event);
        this.props.getPublishedProviderResults(this.state.fundingPeriod, this.state.fundingStream, this.state.specification);
    };

    filterLocalAuthority = (event: React.ChangeEvent<HTMLSelectElement>) => {
        console.log(event.target.value);
        this.setState({localAuthority: event.target.value});
        this.props.filterPublishedProviderResults(this.state.fundingPeriod, this.state.fundingStream, this.state.specification, this.state.providerType, event.target.value, this.state.status, 1, this.state.pageSize);
    };

    filterStatus = (event: React.ChangeEvent<HTMLSelectElement>) => {
        console.log(event.target.value);
        this.setState({status: event.target.value});
        this.props.filterPublishedProviderResults(this.state.fundingPeriod, this.state.fundingStream, this.state.specification, this.state.providerType, this.state.localAuthority, event.target.value, 1, this.state.pageSize);
    };

    filterProviderType = (event: React.ChangeEvent<HTMLSelectElement>) => {
        console.log(event.target.value);
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

    publishFunding = () => {
        this.props.changePageState("PUBLISH_FUNDING");
    };

    confirmApproveFunding = () => {
        this.props.changePageState("APPROVE_FUNDING_JOB");
        this.props.approveFunding(this.props.specifications.id);
    };

    confirmPublishFunding = () => {
        this.setState({pageState: "PUBLISH_FUNDING_JOB"});
        this.props.publishFunding(this.props.specifications.id);
    };

    movePage = (action: string) => {
        let pageNumber = 0;
        switch (action) {
            case "nextPage":
                pageNumber = this.props.publishedProviderResults.pagerState.currentPage + 1;
                break;
            case "previousPage":
                pageNumber = this.props.publishedProviderResults.pagerState.currentPage - 1;
                break;
            case "firstPage":
                pageNumber = 1;
                break;
            case "lastPage":
                pageNumber = this.props.publishedProviderResults.pagerState.lastPage;
                break;
            default:
                pageNumber = 1;
                break;
        }
        this.props.filterPublishedProviderResults(this.state.fundingPeriod, this.state.fundingStream, this.state.specification, this.state.providerType, this.state.localAuthority, this.state.status, pageNumber);
    };

    dismissLoader = () => {
        this.props.changePageState("IDLE");
        this.setState({pageState: "IDLE"});
    };


    render() {
        let breadcrumbs: IBreadcrumbs[] = [
            {
                url: "/",
                name: "Calculate Funding"
            },
            {
                url: "/app/approvals",
                name: "Funding Approvals"
            },
            {
                url: null,
                name: "Choose Specification"
            }];

        if (!this.props.specificationSelected) {
            return <div>
                <Header/>
                <div className="govuk-width-container">
                    <Navigation currentNavigationLevel={NavigationLevel.FundingApproval}/>
                    <Banner bannerType="Left" breadcrumbs={breadcrumbs} title="Choose Specification"
                            subtitle="You can approve and release funding for payment for completed specifications"/>
                    <main className="govuk-main-wrapper govuk-main-wrapper--l"
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
                    </main>
                </div>
                <Footer/>
            </div>;
        }
        if (this.props.specificationSelected) {
            return <div>
                <Header/>
                <Navigation currentNavigationLevel={NavigationLevel.FundingApproval}/>
                <div className="govuk-width-container">
                    <Banner bannerType="Left" breadcrumbs={breadcrumbs} title="Choose Specification"
                            subtitle="You can approve and release funding for payment for completed specifications"/>
                    <main className="container" hidden={this.props.pageState !== "IDLE"}>

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
                        <div className="govuk-grid-row">
                            <div className="govuk-grid-column-one-quarter">
                                <label className="govuk-label" htmlFor="ProviderType">Provider Type</label>
                                <select className="govuk-select" name="ProviderType" id="ProviderType" onChange={(e) => {
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
                                <select className="govuk-select" name="LocalAuthority" id="LocalAuthority" onChange={(e) => {
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
                                <h4 className="govuk-heading-s">Funding Total</h4>
                                <p
                                    className="govuk-body">£{this.props.publishedProviderResults.filteredFundingAmount}</p>
                                <p className="govuk-body">of filtered items</p>
                            </div>
                        </div>
                        <div className="govuk-row">
                            <div className="govuk-grid-column-full">
                                <p className="govuk-body govuk-!-margin-right-1">Showing</p>
                                <select className="govuk-select govuk-!-margin-right-1" name="viewFundingPageSize" id="viewFundingPageSize" onChange={(e) => {
                                    this.changePageSize(e)
                                }}>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                    <option value="200">200</option>
                                </select>
                                <p className="govuk-body govuk-!-margin-right-1">of {this.props.publishedProviderResults.totalResults}</p>
                            </div>
                        </div>
                        <div id="funding-table">
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
                                        <td className="govuk-table__cell">{fp.providerName}</td>
                                        <td className="govuk-table__cell">{fp.ukprn}</td>
                                        <td className="govuk-table__cell">{fp.fundingStatus}</td>
                                        <td className="govuk-table__cell">&pound;{fp.fundingValue}</td>
                                    </tr>
                                )}

                                </tbody>
                            </table>

                            <div className="row">
                                <div className="col-xs-12">
                                    <ul className="pagination">
                                        <li className="hasPrevious">
                                            <button title="View First Page"
                                                    disabled={this.props.publishedProviderResults.currentPage === 1}
                                                    onClick={() => this.movePage("firstPage")}><i
                                                className="material-icons">first_page</i>
                                            </button>
                                        </li>
                                        <li>
                                            <button disabled={this.props.publishedProviderResults.currentPage === 1}
                                                    onClick={() => this.movePage("previousPage")}><i
                                                className="material-icons">chevron_left</i></button>
                                        </li>
                                        <li className="hasNext">
                                            <button title="View Next Page"
                                                    disabled={this.props.publishedProviderResults.currentPage === this.props.publishedProviderResults.pagerState.lastPage}
                                                    onClick={() => this.movePage("nextPage")}><i
                                                className="material-icons">chevron_right</i>
                                            </button>
                                        </li>
                                        <li className="hasNext">
                                            <button title="View Last Page"
                                                    disabled={this.props.publishedProviderResults.currentPage === this.props.publishedProviderResults.pagerState.lastPage}
                                                    onClick={() => this.movePage("lastPage")}><i
                                                className="material-icons">last_page</i>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="govuk-row">
                                    <button className="govuk-button govuk-!-margin-right-1"
                                            onClick={() => this.approveFunding()}>Approve
                                    </button>
                                    <button className="govuk-button govuk-!-margin-right-1"
                                            disabled={!this.props.publishedProviderResults.canPublish}
                                            onClick={() => this.publishFunding()}>Publish
                                    </button>
                                    <button className="govuk-button"
                                            onClick={() => this.refreshFunding()}>Refresh
                                        funding
                                    </button>
                                    <p className="govuk-body">Last refresh on: Not Available</p>
                            </div>
                        </div>

                    </main>
                    <main className="container" hidden={this.props.pageState !== "APPROVE_FUNDING"}>
                        <div className="row">
                            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                <table className="govuk-table">
                                    <caption className="govuk-table__caption">You have selected:</caption>
                                    <thead className="govuk-table__head">
                                    <tr className="govuk-table__row">
                                        <th className="govuk-table__header">Provider Name</th>
                                        <th className="govuk-table__header">Info</th>
                                    </tr>
                                    </thead>
                                    <tbody className="govuk-table__body">
                                    <tr className="govuk-table__row">
                                        <td className="govuk-table__header">Number of providers to approve</td>
                                        <td className="govuk-table__cell">{this.props.publishedProviderResults.totalResults}</td>
                                    </tr>
                                    <tr>
                                        <td className="govuk-table__header">Provider Types Selected</td>
                                        <td className="govuk-table__cell">You have
                                            selected {this.props.publishedProviderResults.providers.length} providers
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="govuk-table__header">Provider local authorities selected</td>
                                        <td className="govuk-table__cell">You have
                                            selected {this.props.publishedProviderResults.facets[2].facetValues.length} local
                                            authorities
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
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
                        <div className="row">
                            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                <div className="spacing-30"></div>
                                <table className="govuk-table">
                                    <thead className="govuk-table__head">
                                    <tr className="govuk-table__row">
                                        <th className="govuk-table__header">Total funding being approved</th>
                                        <th className="govuk-table__header"></th>
                                        <th className="govuk-table__header">£{this.props.publishedProviderResults.filteredFundingAmount}</th>
                                    </tr>
                                    </thead>
                                </table>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 spacing-30">
                                <button className="govuk-button"
                                        onClick={() => this.confirmApproveFunding()}>Confirm Approval
                                </button>

                            </div>
                        </div>
                        <div className="spacing-30"></div>
                    </main>
                    <main className="container" hidden={this.props.pageState !== "PUBLISH_FUNDING"}>
                        <div className="row">
                            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">

                                <table className="">
                                    <caption className="govuk-table__caption">You have selected:</caption>
                                    <thead>
                                    <tr>
                                        <th>Provider Name</th>
                                        <th>Info</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr>
                                        <td>Number of providers to publish</td>
                                        <td>{this.props.publishedProviderResults.totalResults}</td>
                                    </tr>
                                    <tr>
                                        <td>Provider Types Selected</td>
                                        <td>You have
                                            selected {this.props.publishedProviderResults.providers.length} providers
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Provider local authorities selected</td>
                                        <td>You have
                                            selected {this.props.publishedProviderResults.facets[2].facetValues.length} local
                                            authorities
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                <table>
                                    <thead>
                                    <tr>
                                        <th>Specification Details</th>
                                        <th>Info</th>
                                        <th>Funding</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr>
                                        <td>Funding Period</td>
                                        <td>{this.props.specifications.fundingPeriod.name}</td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>Specification selected</td>
                                        <td>{this.props.specifications.name}</td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>Funding Stream</td>
                                        <td>{this.props.specifications.fundingStreams.map(stream =>
                                            stream.name
                                        )}</td>
                                        <td></td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                <table className="govuk-table">
                                    <thead className="govuk-table__head">
                                    <tr className="govuk-table__row">
                                        <th className="govuk-table__head">Total funding being published</th>
                                        <th className="govuk-table__head"></th>
                                        <th className="govuk-table__head">£{this.props.publishedProviderResults.filteredFundingAmount}</th>
                                    </tr>
                                    </thead>
                                </table>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 spacing-30">
                                <button className="button button-publish"
                                        onClick={() => this.confirmPublishFunding()}>Confirm Publish
                                </button>

                            </div>
                        </div>
                    </main>

                    <div className="container" hidden={this.props.pageState !== "REFRESH_FUNDING"}>
                        <NotificationSignal jobType="RefreshFundingJob"
                                            jobId={this.props.pageState === "REFRESH_FUNDING" ? this.props.specifications.id : ""}
                                            message="Waiting to refresh funding" callback={this.props.changePageState}/>
                    </div>
                    <div className="container" hidden={this.props.pageState !== "APPROVE_FUNDING_JOB"}>
                        <NotificationSignal jobType="ApproveFunding"
                                            jobId={this.props.pageState === "APPROVE_FUNDING_JOB" ? this.props.specifications.id : ""}
                                            message="Waiting to approve funding" callback={this.props.changePageState}/>
                    </div>
                    <div className="container" hidden={this.props.pageState !== "PUBLISH_FUNDING_JOB"}>
                        <NotificationSignal jobType="PublishFundingJob"
                                            jobId={this.props.pageState === "PUBLISH_FUNDING_JOB" ? this.props.specifications.id : ""}
                                            message="Waiting to publish funding" callback={this.props.changePageState}/>
                    </div>
                </div>
                <Footer/>
            </div>;
        }
    }
}

