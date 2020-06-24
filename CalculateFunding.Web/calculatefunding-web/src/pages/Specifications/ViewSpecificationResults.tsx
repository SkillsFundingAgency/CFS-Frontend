import * as React from "react"
import {useEffect, useState} from "react"
import {Footer} from "../../components/Footer";
import {Header} from "../../components/Header";
import {Tabs} from "../../components/Tabs";
import {RouteComponentProps} from "react-router";
import {
    getAdditionalCalculations,
    getSpecificationSummary,
    getTemplateCalculations
} from "../../actions/ViewSpecificationResultsActions";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../states/AppState";
import {ViewSpecificationResultsState} from "../../states/ViewSpecificationResultsState";
import Pagination from "../../components/Pagination";
import {Section} from "../../types/Sections";
import {getDownloadableReportsService} from "../../services/specificationService";
import {ReportMetadataViewModel} from "../../types/Specifications/ReportMetadataViewModel";
import {DateFormatter} from "../../components/DateFormatter";
import {Link} from "react-router-dom";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";

export interface ViewSpecificationResultsRoute {
    specificationId: string
}


export function ViewSpecificationResults({match}: RouteComponentProps<ViewSpecificationResultsRoute>) {
    const dispatch = useDispatch();
    const [additionalCalculationsSearchTerm, setAdditionalCalculationsSearchTerm] = useState('');
    const [templateCalculationsSearchTerm, setTemplateCalculationsSearchTerm] = useState('');
    const [templateStatusFilter, setTemplateStatusFilter] = useState("All");
    const [additionalStatusFilter, setAdditionalStatusFilter] = useState("All");
    const [downloadableReports, setDownloadableReports] = useState<ReportMetadataViewModel[]>([]);

    let specificationResults: ViewSpecificationResultsState = useSelector((state: AppState) => state.viewSpecificationResults);

    let specificationId = match.params.specificationId;

    useEffect(() => {
        document.title = "Specification Results - Calculate funding";
        dispatch(getSpecificationSummary(specificationId));
        dispatch(getTemplateCalculations(specificationId, "All", 1, templateCalculationsSearchTerm));
        dispatch(getAdditionalCalculations(specificationId, "All", 1, additionalCalculationsSearchTerm));

        const getLiveDownloadableReports = async () => {
            return getDownloadableReportsService(specificationId);
        };

        getLiveDownloadableReports().then((result) => {
            if (result.status === 200) {
                let response = result.data as ReportMetadataViewModel[];
                setDownloadableReports(response);
            }
        });
            }, [specificationId]);



    function updateTemplateCalculations(event: React.ChangeEvent<HTMLSelectElement>) {
        const filter = event.target.value;
        setTemplateStatusFilter(filter);
        dispatch(getTemplateCalculations(specificationId, filter, 1, templateCalculationsSearchTerm));
    }

    function updateAdditionalCalculations(event: React.ChangeEvent<HTMLSelectElement>) {
        const filter = event.target.value;
        setAdditionalStatusFilter(filter);
        dispatch(getAdditionalCalculations(specificationId, filter, 1, additionalCalculationsSearchTerm));
    }

    function searchAdditionalCalculations() {
        dispatch(getAdditionalCalculations(specificationId, additionalStatusFilter, 1, additionalCalculationsSearchTerm));
    }

    function additionalCalculationsSearch(e: React.ChangeEvent<HTMLInputElement>) {
        setAdditionalCalculationsSearchTerm(e.target.value);
    }

    function searchTemplateCalculations() {
        dispatch(getTemplateCalculations(specificationId, templateStatusFilter, 1, templateCalculationsSearchTerm));
    }

    function templatesCalculationsSearch(e: React.ChangeEvent<HTMLInputElement>) {
        setTemplateCalculationsSearchTerm(e.target.value);
    }

    return <div>
        <Header location={Section.Results}/>
        <div className="govuk-width-container">
            <Breadcrumbs>
                <Breadcrumb name={"Calculate funding"} url={"/"}/>
                <Breadcrumb name={"View results"} url={"/results"} />
                <Breadcrumb name={"Select specification"} url={"/SelectSpecification"}/>
                <Breadcrumb name={specificationResults.specification.name} />
            </Breadcrumbs>
            <div className="govuk-main-wrapper">
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        <h1 className="govuk-heading-xl">{specificationResults.specification.name}</h1>
                        <h2 className="govuk-caption-xl">{specificationResults.specification.fundingPeriod.name}</h2>
                    </div>
                </div>
                <div className="govuk-grid-row govuk-!-padding-top-5">
                    <div className="govuk-grid-column-full">
                        <Tabs initialTab="template-calculations">
                            <ul className="govuk-tabs__list">
                                <Tabs.Tab label="template-calculations">Template Calculations</Tabs.Tab>
                                <Tabs.Tab label="additional-calculations">Additional Calculations</Tabs.Tab>
                                <Tabs.Tab label="downloadable-reports">Downloadable Reports</Tabs.Tab>
                            </ul>
                            <Tabs.Panel label="template-calculations">
                                <section className="govuk-tabs__panel" id="template-calculations">
                                    <h2 className="govuk-heading-l">Template Calculations</h2>
                                    <input className="govuk-input govuk-!-width-three-quarters govuk-!-margin-right-1"
                                           type="text" onChange={(e) => templatesCalculationsSearch(e)}/>
                                    <button className="govuk-button" onClick={searchTemplateCalculations}>Search
                                    </button>
                                    <p className="govuk-body">
                                        Filter by calculation status
                                    </p>
                                    <select name="calculationStatus" id="calculationStatus" className="govuk-select"
                                            onChange={(e) => {
                                                updateTemplateCalculations(e)
                                            }}>
                                        <option value="All">All</option>
                                        <option value="Draft">Draft</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Updated">Updated</option>
                                        <option value="Archived">Archived</option>
                                    </select>
                                    <table className="govuk-table">
                                        <thead className="govuk-table__head">
                                        <tr className="govuk-table__row">
                                            <th scope="col" className="govuk-table__header">Calculation Name</th>
                                            <th scope="col" className="govuk-table__header">Status</th>
                                            <th scope="col" className="govuk-table__header">Updated</th>
                                        </tr>
                                        </thead>
                                        <tbody className="govuk-table__body">
                                        {specificationResults.templateCalculations.results.map(tc =>
                                            <tr key={tc.id} className="govuk-table__row">
                                                <td className="govuk-table__cell">
                                                    <Link to={`/ViewCalculationResults/${tc.id}`}>{tc.name}</Link>
                                                </td>
                                                <td className="govuk-table__cell">{tc.status}</td>
                                                <td className="govuk-table__cell">{tc.lastUpdatedDateDisplay}</td>
                                            </tr>
                                        )}
                                        <tr className="govuk-table__row"
                                            hidden={specificationResults.templateCalculations.totalCount > 0}>
                                            <td className="govuk-table__cell" colSpan={3}>No results were found.</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                    <div className="govuk-grid-row">
                                        <div className="govuk-grid-column-two-thirds">
                                            <Pagination
                                                currentPage={specificationResults.templateCalculations.currentPage}
                                                lastPage={specificationResults.templateCalculations.lastPage}
                                                callback={() => {
                                                }}/>
                                        </div>
                                        <div className="govuk-grid-column-one-third govuk-body govuk-!-padding-top-4">
                                            Showing {specificationResults.templateCalculations.startItemNumber} - {specificationResults.templateCalculations.endItemNumber} of {specificationResults.templateCalculations.totalResults} results
                                        </div>
                                    </div>
                                </section>
                            </Tabs.Panel>
                            <Tabs.Panel label="additional-calculations">
                                <section className="govuk-tabs__panel"
                                         id="additional-calculations">
                                    <h2 className="govuk-heading-l">Additional calculations</h2>
                                    <input className="govuk-input govuk-!-width-three-quarters govuk-!-margin-right-1"
                                           type="text" onChange={(e) => additionalCalculationsSearch(e)}/>
                                    <button className="govuk-button" onClick={searchAdditionalCalculations}>Search
                                    </button>
                                    <p className="govuk-body">
                                        Filter by calculation status
                                    </p>
                                    <select name="calculationStatus" id="calculationStatus" className="govuk-select"
                                            onChange={(e) => {
                                                updateAdditionalCalculations(e)
                                            }}>
                                        <option value="All">All</option>
                                        <option value="Draft">Draft</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Updated">Updated</option>
                                        <option value="Archived">Archived</option>
                                    </select>
                                    <table className="govuk-table">
                                        <thead className="govuk-table__head">
                                        <tr className="govuk-table__row">
                                            <th scope="col" className="govuk-table__header">Calculation Name</th>
                                            <th scope="col" className="govuk-table__header">Status</th>
                                            <th scope="col" className="govuk-table__header">Updated</th>
                                        </tr>
                                        </thead>
                                        <tbody className="govuk-table__body">
                                        {specificationResults.additionalCalculations.results.map(tc =>
                                            <tr className="govuk-table__row">
                                                <td className="govuk-table__cell">
                                                    <Link to={`/ViewCalculationResults/${tc.id}`}>{tc.name}</Link>
                                                </td>
                                                <td className="govuk-table__cell">{tc.status}</td>
                                                <td className="govuk-table__cell">{tc.lastUpdatedDateDisplay}</td>
                                            </tr>
                                        )}
                                        <tr className="govuk-table__row"
                                            hidden={specificationResults.additionalCalculations.totalCount > 0}>
                                            <td className="govuk-table__cell" colSpan={3}>No results were found.</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                    <div className="govuk-grid-row">
                                        <div className="govuk-grid-column-two-thirds">
                                            <Pagination
                                                currentPage={specificationResults.additionalCalculations.currentPage}
                                                lastPage={specificationResults.additionalCalculations.lastPage}
                                                callback={() => {
                                                }}/>
                                        </div>
                                        <div className="govuk-grid-column-one-third govuk-body govuk-!-padding-top-4">
                                            Showing {specificationResults.additionalCalculations.startItemNumber} - {specificationResults.additionalCalculations.endItemNumber} of {specificationResults.additionalCalculations.totalResults} results
                                        </div>
                                    </div>
                                </section>
                            </Tabs.Panel>
                            <Tabs.Panel label="downloadable-reports">
                                <section className="govuk-tabs__panel" id="downloadable-reports">
                                    <h2 className="govuk-heading-l">Downloadable reports</h2>
                                    <div className="govuk-grid-row">
                                        <div className="govuk-grid-column-full">
                                            <div className="govuk-body-l" hidden={downloadableReports.length > 0}>
                                                There are no reports available for this Specification
                                            </div>
                                            <div hidden={downloadableReports.filter(dr => dr.category === "Live").length === 0}>
                                                <h3 className="govuk-heading-m govuk-!-margin-top-5">Live reports</h3>
                                                {downloadableReports.filter(dr => dr.category === "Live").map(dlr => <div>
                                                        <div className="attachment__thumbnail">
                                                            <a href={`/api/specs/${dlr.specificationReportIdentifier}/download-report`} className="govuk-link" target="_self"
                                                               aria-hidden="true">
                                                                <svg
                                                                    className="attachment__thumbnail-image thumbnail-image-small "
                                                                    version="1.1" viewBox="0 0 99 140" width="99"
                                                                    height="140"
                                                                    aria-hidden="true">
                                                                    <path
                                                                        d="M12 12h75v27H12zm0 47h18.75v63H12zm55 2v59H51V61h16m2-2H49v63h20V59z"
                                                                        stroke-width="0"></path>
                                                                    <path
                                                                        d="M49 61.05V120H32.8V61.05H49m2-2H30.75v63H51V59zm34 2V120H69.05V61.05H85m2-2H67v63h20V59z"
                                                                        stroke-width="0"></path>
                                                                    <path
                                                                        d="M30 68.5h56.5M30 77.34h56.5M30 112.7h56.5M30 95.02h56.5M30 86.18h56.5M30 103.86h56.5"
                                                                        fill="none" stroke-miterlimit="10"
                                                                        stroke-width="2"></path>
                                                                </svg>
                                                            </a>
                                                        </div>
                                                        <div className="attachment__details">
                                                            <h4 className="govuk-heading-s">
                                                                <a className="govuk-link" target="_self"
                                                                   href={`/api/specs/${dlr.specificationReportIdentifier}/download-report`}>{dlr.name}</a>
                                                            </h4>
                                                            <p className="govuk-body-s">
                                                                <span>{dlr.format}</span>, <span>{dlr.size}</span>, Updated: <span><DateFormatter
                                                                utc={false} date={dlr.lastModified}/></span>
                                                            </p>
                                                        </div>
                                                    <div className="govuk-clearfix"></div>
                                                    </div>

                                                )}
                                            </div>
                                            <div hidden={downloadableReports.filter(dr => dr.category === "History").length === 0}>
                                                <h3 className="govuk-heading-m govuk-!-margin-top-5">Published reports</h3>
                                                {downloadableReports.filter(dr => dr.category === "History").map(dlr =>
                                                    <div>
                                                        <div className="attachment__thumbnail">
                                                            <a href={`/api/specs/${dlr.specificationReportIdentifier}/download-report`} className="govuk-link" target="_self"
                                                               aria-hidden="true">
                                                            <svg
                                                                    className="attachment__thumbnail-image thumbnail-image-small "
                                                                    version="1.1" viewBox="0 0 99 140" width="99"
                                                                    height="140"
                                                                    aria-hidden="true">
                                                                    <path
                                                                        d="M12 12h75v27H12zm0 47h18.75v63H12zm55 2v59H51V61h16m2-2H49v63h20V59z"
                                                                        stroke-width="0"></path>
                                                                    <path
                                                                        d="M49 61.05V120H32.8V61.05H49m2-2H30.75v63H51V59zm34 2V120H69.05V61.05H85m2-2H67v63h20V59z"
                                                                        stroke-width="0"></path>
                                                                    <path
                                                                        d="M30 68.5h56.5M30 77.34h56.5M30 112.7h56.5M30 95.02h56.5M30 86.18h56.5M30 103.86h56.5"
                                                                        fill="none" stroke-miterlimit="10"
                                                                        stroke-width="2"></path>
                                                                </svg>
                                                            </a>
                                                        </div>
                                                        <div className="attachment__details">
                                                            <h4 className="govuk-heading-s">
                                                                <a className="govuk-link" target="_self"
                                                                   href={`/api/specs/${dlr.specificationReportIdentifier}/download-report`}>{dlr.name}</a>
                                                            </h4>
                                                            <p className="govuk-body-s">
                                                                <span>{dlr.format}</span>, <span>{dlr.size}</span>, Updated: <span><DateFormatter
                                                                utc={false} date={dlr.lastModified}/></span>
                                                            </p>
                                                        </div>
                                                        <div className="govuk-clearfix"></div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </Tabs.Panel>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
        <Footer/>
    </div>
}