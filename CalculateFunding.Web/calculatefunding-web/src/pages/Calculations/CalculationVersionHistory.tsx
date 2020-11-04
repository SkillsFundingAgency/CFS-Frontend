import {Header} from "../../components/Header";
import React, {useState} from "react";
import {RouteComponentProps, useHistory} from "react-router";
import {Section} from "../../types/Sections";
import {getCalculationVersionHistoryService} from "../../services/calculationService";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {CalculationVersionHistorySummary} from "../../types/Calculations/CalculationVersionHistorySummary";
import {DateFormatter} from "../../components/DateFormatter";
import {LoadingStatus} from "../../components/LoadingStatus";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {Footer} from "../../components/Footer";
import {useSpecificationSummary} from "../../hooks/useSpecificationSummary";
import {useErrors} from "../../hooks/useErrors";
import {useCalculation} from "../../hooks/Calculations/useCalculation";
import {LoadingFieldStatus} from "../../components/LoadingFieldStatus";
import {Link} from "react-router-dom";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";

export interface CalculationVersionHistoryRoute {
    calculationId: string
}

export function CalculationVersionHistory({match}: RouteComponentProps<CalculationVersionHistoryRoute>) {
    const calculationId = match.params.calculationId;
    const {errors, addErrorMessage, clearErrorMessages} = useErrors();
    const {calculation, isLoadingCalculation} =
        useCalculation(calculationId, err => addErrorMessage(err.message, "Error while loading calculation"));
    const {specification, isLoadingSpecification} =
        useSpecificationSummary(calculation ? calculation.specificationId : "", 
                err => addErrorMessage(err.message, "Error while loading specification"));
    const [isLoadingVersions, setIsLoadingVersions] = useState<boolean>(true);
    const [checkedVersions, setCheckedVersions] = useState<string[]>([]);
    const [disableCompare, setDisableCompare] = useState<boolean>(true);
    const [calculationVersionHistory, setCalculationVersionHistory] = useState<CalculationVersionHistorySummary[]>([]);
    let history = useHistory();

    function populateCalculationVersionHistory(calculationId: string) {
        getCalculationVersionHistoryService(calculationId).then((result) => {
            const response = result.data as CalculationVersionHistorySummary[];
            setCalculationVersionHistory(response);
            setIsLoadingVersions(false);
        })
    }

    useEffectOnce(() => {
        populateCalculationVersionHistory(calculationId);
    })

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
            history.push(`/Calculations/CompareCalculationVersions/${calculationId}/${checkedVersions[0]}/${checkedVersions[1]}`);
        }
    }

    return <div><Header location={Section.Specifications}/>
        {(isLoadingCalculation || isLoadingSpecification || isLoadingVersions) &&
        <LoadingStatus title={isLoadingCalculation ? "Loading calculation version history" : "Loading"}
                       description={"Please wait"} />
        }
        <MultipleErrorSummary errors={errors} />
        <div className="govuk-width-container">
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                    <Breadcrumbs>
                        <Breadcrumb name={"Calculate funding"} url={"/"}/>
                        <Breadcrumb name={"Specifications"} url={"/SpecificationsList"}/>
                        {specification &&
                        <Breadcrumb name={specification.name} url={`/ViewSpecification/${specification.id}`}/>
                        }
                        {calculation &&
                        <Breadcrumb name={calculation.name}/>
                        }
                        <Breadcrumb name={"Calculation version history"}/>
                    </Breadcrumbs>
                </div>
            </div>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                    <h1 className="govuk-heading-xl">
                        {!isLoadingCalculation && calculation ? calculation.name : <LoadingFieldStatus title="Loading..."/>}
                    </h1>
                </div>
            </div>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                    <div className="govuk-inset-text">
                        Select two versions for comparison
                    </div>
                </div>
            </div>
            <div className="govuk-grid-row" hidden={isLoadingVersions}>
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
                    <button id={"compare-button"} data-prevent-double-click="true" className="govuk-button"
                            data-module="govuk-button"
                            disabled={disableCompare} onClick={compareVersions}>Compare calculations
                    </button>
                </div>
            </div>
            <Link className="govuk-link govuk-back-link govuk-link--no-visited-state"
                  to={`Specifications/EditCalculation/${calculationId}`}>
                Back
            </Link>
        </div>
        <Footer/>
    </div>
}
