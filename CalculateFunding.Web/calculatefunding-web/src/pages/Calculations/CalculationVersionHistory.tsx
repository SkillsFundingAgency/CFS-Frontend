import {RouteComponentProps} from "react-router";
import React, {useEffect, useState} from "react";
import {IBreadcrumbs} from "../../types/IBreadcrumbs";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {Banner} from "../../components/Banner";
import {getCalculationById} from "../../actions/ViewCalculationResultsActions";
import {Calculation, CalculationSummary} from "../../types/CalculationSummary";
import {getCalculationByIdService, getCalculationVersionHistoryService} from "../../services/calculationService";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {getSpecificationSummaryService} from "../../services/specificationService";
import {CalculationVersionHistorySummary} from "../../types/Calculations/CalculationVersionHistorySummary";
import {DateFormatter} from "../../components/DateFormatter";
import {LoadingStatus} from "../../components/LoadingStatus";

export interface CalculationVersionHistoryRoute {
    calculationId: string
}

export function CalculationVersionHistory({match}: RouteComponentProps<CalculationVersionHistoryRoute>) {
    const calculationId = match.params.calculationId;
    const [specification, setSpecification] = useState<SpecificationSummary>({
        approvalStatus: "",
        description: "",
        fundingPeriod: {
            id: "",
            name: ""
        },
        fundingStreams: [],
        id: "",
        isSelectedForFunding: false,
        name: "",
        providerVersionId: ""
    });
    const [calculation, setCalculation] = useState<Calculation>({
        calculationType: "",
        description: null,
        fundingStreamId: "",
        id: "",
        lastUpdatedDate: new Date(),
        lastUpdatedDateDisplay: "",
        name: "",
        namespace: "",
        specificationId: "",
        specificationName: "",
        status: "",
        valueType: "",
        wasTemplateCalculation: false
    });
    const [checkedVersions, setCheckedVersions] = useState<string[]>([]);
    const [disableCompare, setDisableCompare] = useState<boolean>(true);
    const [calculationVersionHistory, setCalculationVersionHistory] = useState<CalculationVersionHistorySummary[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    let breadcrumbs: IBreadcrumbs[] = [
        {
            name: "Calculate funding",
            url: "/app"
        },
        {
            name: "Specifications",
            url: "/app/SpecificationsList"
        },
        {
            name: specification.name,
            url: `/app/ViewSpecification/${specification.id}`
        },
        {
            name: calculation.name,
            url: null
        },
        {
            name: "Calculation version history",
            url: null
        }
    ];

    function populateCalculation() {
        const getCalculationData = async () => {
            let request = getCalculationByIdService(calculationId);
            return request;
        }

        getCalculationData().then((result) => {
            const response = result.data as Calculation;
            setCalculation(response);
        })
    }

    function populateSpecification(specificationId: string) {
        const getSpecificationData = async () => {
            let request = getSpecificationSummaryService(specificationId);
            return request;
        }

        getSpecificationData().then((result) => {
            const response = result.data as SpecificationSummary;
            setSpecification(response);
            setIsLoading(false);
        })
    }

    function populateCalculationVersionHistory(calculationId: string) {
        const getCalculationVersionHistory = async () => {
            let request = getCalculationVersionHistoryService(calculationId);
            return request;
        }

        getCalculationVersionHistory().then((result) => {
            const response = result.data as CalculationVersionHistorySummary[];
            setCalculationVersionHistory(response);
        })
    }

    useEffectOnce(() => {
        populateCalculation();
        populateCalculationVersionHistory(calculationId);
    })

    useEffect(() => {

        if (calculation.specificationId !== "") {
            populateSpecification(calculation.specificationId);
        }

    }, [calculation.specificationId])

    function selectVersion(e: React.ChangeEvent<HTMLInputElement>) {
        const selectedVersion = e.target.value;
        let versions = checkedVersions;

        if (!e.target.checked) {

            for (let i = 0; i < checkedVersions.length; i++) {

                if (versions[i] === selectedVersion) {
                    versions.splice(i, 1);
                }

            }
            setCheckedVersions(versions);

        } else {
            versions.push(selectedVersion);
            setCheckedVersions(versions)
        }

        setDisableCompare(versions.length !== 2);
    }

    function compareVersions() {
        if (!disableCompare) {
            window.location.href = `/app/Calculations/CompareCalculationVersions/${checkedVersions[0]}/${checkedVersions[1]}`;
        }
    }

    return <div><Header location={Section.Specifications}/>
            <LoadingStatus title={"Loading calculation version history"} description={"Please wait whilst calculation versions are loaded"} hidden={!isLoading}/>
        <div className="govuk-width-container" hidden={isLoading}>
            <Banner bannerType="Left" breadcrumbs={breadcrumbs} title="" subtitle=""/>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                    <h1 className="govuk-heading-xl">{calculation.name}</h1>
                </div>
            </div>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                    <div className="govuk-inset-text">
                        Select two versions for comparison
                    </div>
                </div>
            </div>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                    <table className="govuk-table table-vertical-align">
                        <caption className="govuk-table__caption">Specification</caption>
                        <thead className="govuk-table__head">
                        <tr className="govuk-table__row">
                            <th scope="col" className="govuk-table__header">Choose</th>
                            <th scope="col" className="govuk-table__header govuk-!-width-one-quarter">Status</th>
                            <th scope="col" className="govuk-table__header">Version</th>
                            <th scope="col" className="govuk-table__header">Updated</th>
                            <th scope="col" className="govuk-table__header">Author</th>
                        </tr>
                        </thead>
                        <tbody className="govuk-table__body">
                        {calculationVersionHistory.map(cvh =>
                            <tr className="govuk-table__row" key={cvh.version}>
                                <th scope="row" className="govuk-table__header">
                                    <div className="govuk-checkboxes__item govuk-checkboxes--small">
                                        <input className="govuk-checkboxes__input"
                                               id={`provider-approval-${cvh.version}`}
                                               name="provider-approval" type="checkbox" value={`${cvh.version}`}
                                               onChange={(e) => selectVersion(e)}/>
                                        <label className="govuk-label govuk-checkboxes__label"
                                               htmlFor="provider-approval"></label>
                                    </div>
                                </th>
                                <td className="govuk-table__cell">{cvh.publishStatus}</td>
                                <td className="govuk-table__cell">{cvh.version}</td>
                                <td className="govuk-table__cell"><DateFormatter date={cvh.lastUpdated} utc={false}/>
                                </td>
                                <td className="govuk-table__cell">{cvh.author.name}</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                    <button id={"compare-button"} data-prevent-double-click="true" className="govuk-button" data-module="govuk-button"
                            disabled={disableCompare} onClick={compareVersions}>
                        Compare calculations
                    </button>
                    <br/>
                    <a href={`/app/ViewSpecification/${specification.id}`} className="govuk-back-link">Back</a>
                </div>
            </div>
        </div>
    </div>

}