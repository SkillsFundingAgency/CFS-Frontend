import {RouteComponentProps} from "react-router";
import {Header} from "../../components/Header";
import {Banner} from "../../components/Banner";
import * as React from "react";
import {useEffect, useState} from "react";
import {IBreadcrumbs} from "../../types/IBreadcrumbs";
import {Footer} from "../../components/Footer";
import {Tabs} from "../../components/Tabs";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../states/AppState";
import {
    changeFundingLineState,
    confirmTimetableChanges,
    getAdditionalCalculations,
    getDatasetBySpecificationId,
    getFundingLineStructure,
    getReleaseTimetable
} from "../../actions/ViewSpecificationsActions";
import {ViewSpecificationState} from "../../states/ViewSpecificationState";
import {SaveReleaseTimetableViewModel} from "../../types/SaveReleaseTimetableViewModel";
import {DateInput} from "../../components/DateInput";
import {TimeInput} from "../../components/TimeInput";
import Pagination from "../../components/Pagination";
import {Details} from "../../components/Details";
import {FundingStructureType, IFundingStructureItem} from "../../types/FundingStructureItem";
import {ApproveStatusButton} from "../../components/ApproveStatusButton";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {getSpecificationSummaryService} from "../../services/specificationService";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import {Section} from "../../types/Sections";
import {DateFormatter} from "../../components/DateFormatter";
import {CollapsibleSteps} from "../../components/CollapsibleSteps";

export interface ViewSpecificationRoute {
    specificationId: string;
}

export function ViewSpecification({match}: RouteComponentProps<ViewSpecificationRoute>) {
    const dispatch = useDispatch();
    const [additionalCalculationsSearchTerm,] = useState('');
    const [statusFilter] = useState("");
    const [navisionDate, setNavisionDate] = useState();
    const [releaseDate, setReleaseDate] = useState();
    const [navisionTime, setNavisionTime] = useState();
    const [releaseTime, setReleaseTime] = useState();
    const [canTimetableBeUpdated, setCanTimetableBeUpdated] = useState(true);
    const initialSpecification: SpecificationSummary = {
            name: "",
            approvalStatus: "",
            description: "",
            fundingPeriod: {
                id: "",
                name: ""
            },
            fundingStreams: [{
                name: "",
                id: ""
            }],
            id: "",
            isSelectedForFunding: false,
            providerVersionId: ""
        };
    const [specification, setSpecification] = useState<SpecificationSummary>(initialSpecification);
    let viewSpecification: ViewSpecificationState = useSelector((state: AppState) => state.viewSpecification);
    let specificationId = match.params.specificationId;
    let saveReleaseTimetable: SaveReleaseTimetableViewModel;

    useEffect(() => {
        document.title = "Specification Results - Calculate Funding";
        dispatch(getAdditionalCalculations(specificationId, statusFilter, 1, additionalCalculationsSearchTerm));
        dispatch(getDatasetBySpecificationId(specificationId));
        dispatch(getReleaseTimetable(specificationId));
    }, [specificationId]);

    useEffectOnce(() => {
        const getSpecification = async () => {
            const specificationResult = await getSpecificationSummaryService(specificationId);
            setSpecification(specificationResult.data);
            return specificationResult;
        };
        getSpecification().then((result) => {
            if (result.status === 200) {
                const response = result.data as SpecificationSummary;
                dispatch(getFundingLineStructure(response.id, response.fundingStreams[0].id));
            }
            return true;
        });
    });

    useEffect(() => {
        return () => setCanTimetableBeUpdated(true);
    }, [viewSpecification]);

    let breadcrumbs: IBreadcrumbs[] = [
        {
            name: "Calculate funding",
            url: "/app"
        },
        {
            name: "View specification",
            url: "/app/SpecificationsList"
        },
        {
            name: specification.name,
            url: null
        }
    ];

    function confirmChanges() {
        setCanTimetableBeUpdated(false);
        let navDateAndTime2 = updateDateWithTime(navisionDate, navisionTime);
        let releaseDate2 = updateDateWithTime(releaseDate, releaseTime);
        saveReleaseTimetable = {
            specificationId: specification.id,
            statementDate: navDateAndTime2,
            fundingDate: releaseDate2
        };
        dispatch(confirmTimetableChanges(saveReleaseTimetable));
    }

    function updateDateWithTime(date: Date, time: string) {
        let timeParts = time.match(/(\d+):(\d+)/);
        if (timeParts !== null) {
            let hours = timeParts[1];
            let minutes = timeParts[2];
            if (hours !== null && minutes !== null) {
                date.setHours(hours as unknown as number);
                date.setMinutes(minutes as unknown as number);
            }
        }
        return date;
    }

    function updateNavisionDate(e: Date) {
        setNavisionDate(e);
    }

    function updateReleaseDate(e: Date) {
        setReleaseDate(e);
    }

    function updateNavisionTime(e: string) {
        setNavisionTime(e);
    }

    function updateReleaseTime(e: string) {
        setReleaseTime(e);
    }

    function movePage(pageNumber : number)
    {
        dispatch(getAdditionalCalculations(specificationId, statusFilter, pageNumber, additionalCalculationsSearchTerm));
    }

    function updateFundingLineState(specificationId : string)
    {
        dispatch(changeFundingLineState(specificationId));
    }

    let fundingLineStatus = specification.approvalStatus;
    if (viewSpecification.fundingLineStatusResult !== null && viewSpecification.fundingLineStatusResult !== "")
        fundingLineStatus = viewSpecification.fundingLineStatusResult;

    const FundingLineItem: React.FC<IFundingStructureItem> = ({ fundingStructureItems }) => {
        let fundingType: string = "";
        const parentFundingLineName :string = fundingStructureItems.length > 0 ? fundingStructureItems[0].name : "";
        return (
            <React.Fragment>
            {
                (fundingStructureItems != null && fundingStructureItems.length > 0)? fundingStructureItems.map((innerFundingLineItem, index) => {
                    let displayFundingType = false;
                    if (fundingType != FundingStructureType[innerFundingLineItem.type])
                    {
                        displayFundingType = true;
                        fundingType = FundingStructureType[innerFundingLineItem.type];
                    }

                    let linkValue = '';
                    if (innerFundingLineItem.calculationId != null && innerFundingLineItem.calculationId != '') {
                        linkValue = `/app/Specifications/EditTemplateCalculation/${innerFundingLineItem.calculationId}/${parentFundingLineName}`;
                    }
                    return (
                        <CollapsibleSteps
                            key={index}
                            uniqueKey={index.toString()}
                            title={displayFundingType?fundingType: ""}
                            description={innerFundingLineItem.name}
                            status={(innerFundingLineItem.calculationPublishStatus != null && innerFundingLineItem.calculationPublishStatus != '') ?
                            innerFundingLineItem.calculationPublishStatus: ""}
                            step={displayFundingType?innerFundingLineItem.level.toString(): ""}
                            expanded={false}
                            link={linkValue}
                            hasChildren={innerFundingLineItem.fundingStructureItems != null && innerFundingLineItem.fundingStructureItems.length > 0}>
                            {
                                innerFundingLineItem.fundingStructureItems ?
                                    (<FundingLineItem calculationId={innerFundingLineItem.calculationId}
                                                      calculationPublishStatus={innerFundingLineItem.calculationPublishStatus}
                                                      type={innerFundingLineItem.type}
                                                      level={innerFundingLineItem.level}
                                                      name={innerFundingLineItem.name}
                                                      fundingStructureItems={innerFundingLineItem.fundingStructureItems}
                                    parentName={innerFundingLineItem.name}/>)
                                    : null
                            }
                        </CollapsibleSteps>
                    )
                    }
                )
                    : null
            }
        </React.Fragment>
    )
    };

    return <div>
        <Header location={Section.Specifications}/>
        <div className="govuk-width-container">
            <Banner bannerType="Left" breadcrumbs={breadcrumbs} title="" subtitle=""/>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    <span className="govuk-caption-l">Specification Name</span>
                    <h2 className="govuk-heading-l">{specification.name}</h2>
                    <span className="govuk-caption-m">Funding period</span>
                    <h3 className="govuk-heading-m">{specification.fundingPeriod.name}</h3>
                </div>
            </div>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    <span className="govuk-caption-m">Funding streams</span>
                    <h3 className="govuk-heading-m">{specification.fundingStreams[0].name}</h3>
                </div>
                <div className="govuk-grid-column-one-third">
                    <ul className="govuk-list">
                        <li>
                            <a className="govuk-link"
                               href={`/app/specifications/editspecification/${specificationId}`}>Edit specification</a>
                        </li>
                        <li>
                            <a className="govuk-link"
                               href={`/app/specifications/createadditionalcalculation/${specificationId}`}>Create additional calculation</a>
                        </li>
                        <li>
                            <a className="govuk-link" href={`/app/Datasets/CreateDataset/${specificationId}`}>Create dataset</a>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="govuk-main-wrapper">
                <div className="govuk-grid-row">
                    <Details title={`What is ${specification.name}`} body={specification.description}/>
                    <Tabs initialTab="fundingline-structure">
                        <ul className="govuk-tabs__list">
                            <Tabs.Tab label="fundingline-structure">Funding line structure</Tabs.Tab>
                            <Tabs.Tab label="additional-calculations">Additional calculations</Tabs.Tab>
                            <Tabs.Tab label="datasets">Datasets</Tabs.Tab>
                            <Tabs.Tab label="release-timetable">Release timetable</Tabs.Tab>
                        </ul>
                        <Tabs.Panel label="fundingline-structure">
                            <section className="govuk-tabs__panel" id="fundingline-structure">
                                <div className="govuk-grid-row">
                                    <div className="govuk-grid-column-two-thirds">
                                        <h2 className="govuk-heading-l">Funding line structure</h2>
                                    </div>
                                    <div className="govuk-grid-column-one-third ">
                                        <ApproveStatusButton id={specification.id}
                                                             status={fundingLineStatus}
                                                             callback={updateFundingLineState}/>
                                    </div>
                                </div>
                                <ul className="collapsible-steps">
                                {
                                    viewSpecification.fundingLineStructureResult.map((f, index) => {
                                    let linkValue = '';
                                    if (f.calculationId != null && f.calculationId != '') {
                                        linkValue = `/app/Specifications/EditTemplateCalculation/${f.calculationId}`;
                                    }

                                    return <li key={"collapsible-steps-top"+index} className="collapsible-step step-is-shown"><CollapsibleSteps
                                        key={"collapsible-steps"+ index}
                                        uniqueKey={index.toString()}
                                        title={FundingStructureType[f.type]}
                                        description={f.name}
                                        status={(f.calculationPublishStatus != null && f.calculationPublishStatus != '') ?
                                            f.calculationPublishStatus: ""}
                                        step={f.level.toString()}
                                        expanded={false}
                                        link={linkValue}
                                        hasChildren={f.fundingStructureItems != null}>
                                        {
                                            viewSpecification.fundingLineStructureResult.map(innerFundingLineItem =>{
                                                return <FundingLineItem key={innerFundingLineItem.name.replace(" ", "") + index}
                                                                        calculationId={innerFundingLineItem.calculationId}
                                                                        calculationPublishStatus={innerFundingLineItem.calculationPublishStatus}
                                                                        type={innerFundingLineItem.type}
                                                                        level={innerFundingLineItem.level}
                                                                        name={innerFundingLineItem.name}
                                                                        fundingStructureItems={innerFundingLineItem.fundingStructureItems}
                                                parentName={f.name}/>
                                            })
                                        }
                                        </CollapsibleSteps>
                                    </li>
                                })}
                                </ul>
                            </section>
                        </Tabs.Panel>
                        <Tabs.Panel label="additional-calculations">
                            <section className="govuk-tabs__panel" id="additional-calculations">
                                <div className="govuk-grid-row">
                                    <div className="govuk-grid-column-two-thirds">
                                        <h2 className="govuk-heading-l">Additional calculations</h2>
                                    </div>
                                    <div className="govuk-grid-column-one-third ">
                                        <p className="govuk-body right-align"
                                           hidden={viewSpecification.additionalCalculations.totalResults === 0}>
                                            Showing {viewSpecification.additionalCalculations.startItemNumber} - {viewSpecification.additionalCalculations.endItemNumber}
                                            of {viewSpecification.additionalCalculations.totalResults}
                                            calculations
                                        </p>
                                    </div>
                                </div>
                                <div className="govuk-grid-row">
                                    <div className="govuk-grid-column-two-thirds">
                                        <div className="govuk-form-group search-container">
                                            <input className="govuk-input input-search" id="event-name"
                                                   name="event-name" type="text"/>
                                        </div>
                                    </div>
                                    <div className="govuk-grid-column-one-third">
                                        <button className="govuk-button" type="submit">Search</button>
                                    </div>
                                </div>
                                <table className="govuk-table">
                                    <thead className="govuk-table__head">
                                    <tr className="govuk-table__row">
                                        <th scope="col" className="govuk-table__header">Additional calculation name</th>
                                        <th scope="col" className="govuk-table__header">Status</th>
                                        <th scope="col" className="govuk-table__header">Value type</th>
                                        <th scope="col" className="govuk-table__header">Last edited date</th>
                                    </tr>
                                    </thead>
                                    <tbody className="govuk-table__body">
                                    {viewSpecification.additionalCalculations.results.map((ac, index) =>
                                        <tr className="govuk-table__row" key={index}>
                                            <td className="govuk-table__cell"><a href={`/app/Specifications/EditAdditionalCalculation/${ac.id}`}>{ac.name}</a></td>
                                            <td className="govuk-table__cell">{ac.status}</td>
                                            <td className="govuk-table__cell">{ac.valueType}</td>
                                            <td className="govuk-table__cell"><DateFormatter date={ac.lastUpdatedDate} utc={false}/></td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>

                                <div className="govuk-warning-text" hidden={viewSpecification.additionalCalculations.totalCount > 0}>
                                    <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
                                    <strong className="govuk-warning-text__text">
                                        <span className="govuk-warning-text__assistive">Warning</span>
                                        No additional calculations available. <a
                                        href={`/app/specifications/createadditionalcalculation/${specificationId}`}>Create a
                                        calculation</a>
                                    </strong>
                                </div>
                                <nav className="govuk-!-margin-top-9" role="navigation" aria-label="Pagination">
                                    <div className="pagination__summary">
                                        <p className="govuk-body right-align" hidden={viewSpecification.additionalCalculations.totalResults === 0}>
                                            Showing
                                            {viewSpecification.additionalCalculations.startItemNumber} - {viewSpecification.additionalCalculations.endItemNumber}
                                            of {viewSpecification.additionalCalculations.totalResults} calculations
                                        </p>
                                    </div>
                                    <Pagination currentPage={viewSpecification.additionalCalculations.currentPage}
                                                lastPage={viewSpecification.additionalCalculations.lastPage} callback={movePage} />
                                </nav>
                            </section>
                        </Tabs.Panel>
                        <Tabs.Panel label="datasets">
                            <section className="govuk-tabs__panel" id="datasets">
                                <div className="govuk-grid-row">
                                    <div className="govuk-grid-column-two-thirds">
                                        <h2 className="govuk-heading-l">Datasets</h2>
                                    </div>
                                    <div className="govuk-grid-column-one-third">
                                        <a className="govuk-link govuk-button" data-module="govuk-button"
                                           href="/datasets/datasetrelationships">Map
                                            data source file to data set</a>
                                    </div>
                                </div>
                                <table className="govuk-table">
                                    <caption className="govuk-table__caption">Dataset and schemas</caption>
                                    <thead className="govuk-table__head">
                                    <tr className="govuk-table__row">
                                        <th scope="col" className="govuk-table__header govuk-!-width-one-half">Dataset
                                        </th>
                                        <th scope="col" className="govuk-table__header govuk-!-width-one-half">Data
                                            schema
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="govuk-table__body">
                                    {viewSpecification.datasets.content.map(ds =>
                                        <tr className="govuk-table__row" key={ds.id}>
                                            <td scope="row" className="govuk-table__cell">{ds.name}
                                                <div className="govuk-!-margin-top-2">
                                                    <details className="govuk-details govuk-!-margin-bottom-0"
                                                             data-module="govuk-details">
                                                        <summary className="govuk-details__summary">
                                                        <span
                                                            className="govuk-details__summary-text">Dataset Description</span>
                                                        </summary>
                                                        <div className="govuk-details__text">
                                                            {ds.relationshipDescription}
                                                        </div>
                                                    </details>
                                                </div>
                                            </td>
                                            <td className="govuk-table__cell">{ds.definition.name}</td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </section>
                        </Tabs.Panel>
                        <Tabs.Panel label="release-timetable">
                            <section className="govuk-tabs__panel" id="additional-calculations">
                                <div className="govuk-grid-row">
                                    <div className="govuk-grid-column-full">
                                        <h2 className="govuk-heading-l">Release timetable</h2>
                                    </div>
                                </div>
                                <div className="govuk-form-group">
                                    <fieldset className="govuk-fieldset" role="group"
                                              aria-describedby="passport-issued-hint">
                                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                                            <h3 className="govuk-heading-m">Release date of funding to Navison?</h3>
                                        </legend>
                                        <span id="passport-issued-hint"
                                              className="govuk-hint">Set the date and time that the statement will be
                                            published externally for this funding stream. <br/>For example, 12 11 2019</span>
                                        <DateInput year={parseInt(viewSpecification.releaseTimetable.navisionDate.year)}
                                                   month={parseInt(viewSpecification.releaseTimetable.navisionDate.month)}
                                                   day={parseInt(viewSpecification.releaseTimetable.navisionDate.day)}
                                                   callback={updateNavisionDate} />
                                    </fieldset>
                                </div>
                                <div className="govuk-form-group govuk-!-margin-bottom-9">
                                    <TimeInput time={viewSpecification.releaseTimetable.navisionDate.time}
                                               callback={updateNavisionTime}/>
                                </div>
                                <div className="govuk-form-group">
                                    <fieldset className="govuk-fieldset" role="group"
                                              aria-describedby="passport-issued-hint">
                                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                                            <h3 className="govuk-heading-m">Release date of statement to providers?</h3>
                                        </legend>
                                        <span id="passport-issued-hint"
                                              className="govuk-hint">Set the date and time that the statement will be published externally for this funding stream. <br/>For example, 12 11 2019</span>
                                        <DateInput year={parseInt(viewSpecification.releaseTimetable.releaseDate.year)}
                                                   month={parseInt(viewSpecification.releaseTimetable.releaseDate.month)}
                                                   day={parseInt(viewSpecification.releaseTimetable.releaseDate.day)}
                                                   callback={updateReleaseDate} />
                                    </fieldset>
                                </div>
                                <div className="govuk-form-group govuk-!-margin-bottom-9">
                                    <TimeInput time={viewSpecification.releaseTimetable.releaseDate.time}
                                               callback={updateReleaseTime}/>
                                </div>
                                <div className="govuk-form-group">
                                    <button className="govuk-button" onClick={confirmChanges} disabled={!canTimetableBeUpdated} >Confirm changes</button>
                                </div>
                            </section>
                        </Tabs.Panel>
                    </Tabs>
                </div>
            </div>
        </div>
        <Footer/>
        <script src="https://assets.publishing.service.gov.uk/static/libs/jquery/jquery-1.12.4-c731c20e2995c576b0509d3bd776f7ab64a66b95363a3b5fae9864299ee594ed.js"></script>
        <script src="https://assets.publishing.service.gov.uk/static/header-footer-only-6210a252b9670a3fc6e36340f28c427d2a1b43d722bf5cb17eb364117aedec64.js"></script>
        <script src="https://assets.publishing.service.gov.uk/static/surveys-70eb9715dca54df50152ddc5ea606c651ce9b9ea2060809685edc1616337d16c.js"></script>
        <script src="https://assets.publishing.service.gov.uk/collections/application-11e083324c70619623a8a1f482760617547dac4cd2200c04129d52cdf97d6c40.js"></script>
    </div>
}

