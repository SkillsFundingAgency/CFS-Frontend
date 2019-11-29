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
        this.props.getSelectedSpecifications(event.target.value, "PSG");
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
        //this.props.approveFunding(this.props.specifications.id)
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
                <Navigation currentNavigationLevel={NavigationLevel.FundingApproval}/>
                <Banner bannerType="Left" breadcrumbs={breadcrumbs} title="Choose Specification"
                        subtitle="You can approve and release funding for payment for completed specifications"/>
                <main className="container" hidden={this.props.specificationSelected}>

                    <fieldset className="govuk-fieldset">
                        <div className="govuk-form-group">
                            <label htmlFor="select-funding-stream" className="govuk-fieldset__heading">Select funding
                                stream:</label>
                        </div>
                        <div className="govuk-form-group">
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
                    <fieldset className="govuk-fieldset spacing-30">
                        <div className="govuk-form-group">
                            <label htmlFor="select-provider" className="govuk-fieldset__heading">Select funding
                                period:</label>
                        </div>
                        <div className="govuk-form-group">
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
                        <div className="form-group" hidden={this.props.specifications.name === ""}>
                            <div className="form-label">
                                <label htmlFor="select-provider"
                                       className="govuk-fieldset__heading">Specification:</label>
                            </div>
                            <input type="text" disabled={true} value={this.props.specifications.name}/>
                        </div>
                    </fieldset>
                    <div className="row">
                        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                            <div className="form-group">
                                <button className="button button-publish" onClick={(e) => this.viewFunding(e)}
                                        disabled={this.props.specifications.id === ""}>View
                                    Funding
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer/>
            </div>;
        }
        if (this.props.specificationSelected) {
            return <div>
                <Header/>
                <Navigation currentNavigationLevel={NavigationLevel.FundingApproval}/>
                <Banner bannerType="Left" breadcrumbs={breadcrumbs} title="Choose Specification"
                        subtitle="You can approve and release funding for payment for completed specifications"/>
                <main className="container" hidden={this.props.pageState !== "IDLE"}>
                    <p><i className="glyphicon glyphicon-exclamation-sign"> </i> Only one funding stream can be approved
                        or
                        released at a time</p>

                    <div className="row table-filter-container">
                        <div className="col-xs-2 col-sm-2 col-md-3 col-lg-3">
                            <label htmlFor="ProviderType">Provider Type</label>
                            <select name="ProviderType" id="ProviderType" onChange={(e) => {
                                this.filterProviderType(e)
                            }}>
                                <option value="">Show all</option>
                                {this.props.filterTypes[0].facetValues.map(facet =>
                                    <option key={facet.name}>{facet.name}</option>
                                )}
                            </select>
                        </div>
                        <div className="col-xs-2 col-sm-2 col-md-3 col-lg-3">
                            <label htmlFor="LocalAuthority">Local Authority</label>
                            <select name="LocalAuthority" id="LocalAuthority" onChange={(e) => {
                                this.filterLocalAuthority(e)
                            }}>
                                <option value="">Show all</option>
                                {this.props.filterTypes[1].facetValues.map(facet =>
                                    <option key={facet.name}>{facet.name}</option>
                                )}
                            </select>
                        </div>
                        <div className="col-xs-2 col-sm-2 col-md-3 col-lg-4">
                            <label htmlFor="Status">Status</label>
                            <select name="Status" id="Status" onChange={(e) => {
                                this.filterStatus(e)
                            }}>
                                <option value="">Show all</option>
                                {this.props.filterTypes[2].facetValues.map(facet =>
                                    <option key={facet.name}>{facet.name}</option>
                                )}
                            </select>
                        </div>
                        <div className="col-xs-3 col-sm-3 col-md-3 col-lg-2 pull-right">
                            <span>Funding Total</span>
                            <div
                                className="bold-medium">£{this.props.publishedProviderResults.filteredFundingAmount}</div>
                            <span>of filtered items</span>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                            Showing
                            <select name="viewFundingPageSize" id="viewFundingPageSize" onChange={(e) => {
                                this.changePageSize(e)
                            }}>
                                <option value="50">50</option>
                                <option value="100">100</option>
                                <option value="200">200</option>
                            </select>
                            of {this.props.publishedProviderResults.totalResults}
                        </div>
                    </div>
                    <div id="funding-table">
                        <table>
                            <thead>
                            <tr>
                                <td className="table-type-header">Provider name</td>
                                <td>UKPRN</td>
                                <td>Status</td>
                                <td>Funding total</td>
                            </tr>
                            </thead>
                            <tbody>
                            {this.props.publishedProviderResults.providers.map(fp =>
                                <tr key={fp.id}>
                                    <td>{fp.providerName}</td>
                                    <td>{fp.ukprn}</td>
                                    <td>{fp.fundingStatus}</td>
                                    <td>&pound;{fp.fundingValue}</td>
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
                        <div className="row">
                            <div
                                className="col-xs-3 col-sm-3 col-md-3 col-lg-3 col-xs-offset-9 col-sm-offset-9 col-md-offset-9 col-lg-offset-9">
                                <button className="button button-publish"
                                        onClick={() => this.approveFunding()}>Approve
                                </button>
                                <button className="button button-publish"
                                        disabled={!this.props.publishedProviderResults.canPublish}
                                        onClick={() => this.publishFunding()}>Publish
                                </button>
                                <button className="button button-publish"
                                        onClick={() => this.refreshFunding()}>Refresh
                                    funding
                                </button>
                                <p>Last refresh on: Not Available</p>
                            </div>
                        </div>
                    </div>

                </main>
                <main className="container" hidden={this.props.pageState !== "APPROVE_FUNDING"}>
                    <div className="row">
                        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                            <h2>You have selected:</h2>
                            <table>
                                <thead>
                                <tr>
                                    <th>Provider Name</th>
                                    <th>Info</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td>Number of providers to approve</td>
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
                            <div className="spacing-30"></div>
                            <table>
                                <thead>
                                <tr>
                                    <th>Total funding being approved</th>
                                    <th></th>
                                    <th>£{this.props.publishedProviderResults.filteredFundingAmount}</th>
                                </tr>
                                </thead>
                            </table>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 spacing-30">
                            <button className="button button-publish"
                                    onClick={() => this.confirmApproveFunding()}>Confirm Approval
                            </button>

                        </div>
                    </div>
                    <div className="spacing-30"></div>
                </main>
                <main className="container" hidden={this.props.pageState !== "PUBLISH_FUNDING"}>
                    <div className="row">
                        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                            <h2>You have selected:</h2>
                            <table>
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
                            <div className="spacing-30"></div>
                            <table>
                                <thead>
                                <tr>
                                    <th>Total funding being published</th>
                                    <th></th>
                                    <th>£{this.props.publishedProviderResults.filteredFundingAmount}</th>
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
                    <div className="spacing-30"></div>
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

                <Footer/>
            </div>;
        }
    }
}

