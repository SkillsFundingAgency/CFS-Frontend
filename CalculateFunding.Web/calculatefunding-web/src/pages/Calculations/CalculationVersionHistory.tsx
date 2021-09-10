import { AxiosError } from "axios";
import React, { useState } from "react";
import { useQuery } from "react-query";
import { RouteComponentProps, useHistory } from "react-router";
import { Link } from "react-router-dom";

import { BackLink } from "../../components/BackLink";
import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import { DateTimeFormatter } from "../../components/DateTimeFormatter";
import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";
import { LoadingFieldStatus } from "../../components/LoadingFieldStatus";
import { LoadingStatus } from "../../components/LoadingStatus";
import { MultipleErrorSummary } from "../../components/MultipleErrorSummary";
import { useCalculation } from "../../hooks/Calculations/useCalculation";
import { useErrors } from "../../hooks/useErrors";
import { useSpecificationSummary } from "../../hooks/useSpecificationSummary";
import { getCalculationVersionHistoryService } from "../../services/calculationService";
import { CalculationVersionHistorySummary } from "../../types/Calculations/CalculationVersionHistorySummary";
import { Section } from "../../types/Sections";

export interface CalculationVersionHistoryRoute {
  calculationId: string;
}

export function CalculationVersionHistory({ match }: RouteComponentProps<CalculationVersionHistoryRoute>) {
  const calculationId = match.params.calculationId;
  const { errors, addErrorMessage, clearErrorMessages } = useErrors();
  const { calculation, isLoadingCalculation } = useCalculation(calculationId, (err) =>
    addErrorMessage(err.message, "Error while loading calculation")
  );
  const { specification, isLoadingSpecification } = useSpecificationSummary(
    calculation ? calculation.specificationId : "",
    (err) => addErrorMessage(err.message, "Error while loading specification")
  );
  const { data: calculationVersionHistory, isLoading: isLoadingVersions } = useQuery<
    CalculationVersionHistorySummary[],
    AxiosError
  >(
    `calc-${calculationId}-versions`,
    async () => (await getCalculationVersionHistoryService(calculationId)).data,
    {
      onError: (err) => addErrorMessage(err.message, "Error while loading calculation versions"),
    }
  );

  const [checkedVersions, setCheckedVersions] = useState<string[]>([]);
  const [disableCompare, setDisableCompare] = useState<boolean>(true);
  const history = useHistory();

  function selectVersion(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedVersion = e.target.value;
    const versions = checkedVersions;

    if (!e.target.checked) {
      for (let i = 0; i < checkedVersions.length; i++) {
        if (versions[i] === selectedVersion) {
          versions.splice(i, 1);
        }
      }

      setCheckedVersions(versions);
    } else {
      versions.push(selectedVersion);
      setCheckedVersions(versions);
    }

    setDisableCompare(versions.length !== 2);
  }

  function compareVersions() {
    if (!disableCompare) {
      history.push(
        `/Calculations/CompareCalculationVersions/${calculationId}/${checkedVersions[0]}/${checkedVersions[1]}`
      );
    }
  }

  return (
    <div>
      <Header location={Section.Specifications} />
      {(isLoadingCalculation || isLoadingSpecification || isLoadingVersions) && (
        <LoadingStatus
          title={
            isLoadingCalculation
              ? "Loading calculation"
              : isLoadingVersions
              ? "Loading calculation version history"
              : "Loading specification"
          }
          description={"Please wait"}
        />
      )}
      <MultipleErrorSummary errors={errors} />
      <div className="govuk-width-container">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <Breadcrumbs>
              <Breadcrumb name={"Calculate funding"} url={"/"} />
              <Breadcrumb name={"Specifications"} url={"/SpecificationsList"} />
              {specification && (
                <Breadcrumb name={specification.name} url={`/ViewSpecification/${specification.id}`} />
              )}
              {calculation && <Breadcrumb name={calculation.name} />}
              <Breadcrumb name={"Calculation version history"} />
            </Breadcrumbs>
          </div>
        </div>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h1 className="govuk-heading-xl">
              {!isLoadingCalculation && calculation ? (
                calculation.name
              ) : (
                <LoadingFieldStatus title="Loading..." />
              )}
            </h1>
          </div>
        </div>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <div className="govuk-inset-text">Select two versions for comparison</div>
          </div>
        </div>
        <div className="govuk-grid-row" hidden={isLoadingVersions}>
          <div className="govuk-grid-column-full">
            <table className="govuk-table table-vertical-align">
              <caption className="govuk-table__caption">Specification</caption>
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header">
                    Choose
                  </th>
                  <th scope="col" className="govuk-table__header govuk-!-width-one-quarter">
                    Status
                  </th>
                  <th scope="col" className="govuk-table__header">
                    Version
                  </th>
                  <th scope="col" className="govuk-table__header">
                    Updated
                  </th>
                  <th scope="col" className="govuk-table__header">
                    Author
                  </th>
                </tr>
              </thead>
              <tbody className="govuk-table__body" data-testid="calc-versions">
                {calculationVersionHistory &&
                  calculationVersionHistory.map((cvh) => (
                    <tr className="govuk-table__row" key={cvh.version}>
                      <th scope="row" className="govuk-table__header">
                        <div className="govuk-checkboxes__item govuk-checkboxes--small">
                          <input
                            className="govuk-checkboxes__input"
                            id={`provider-approval-${cvh.version}`}
                            name="provider-approval"
                            type="checkbox"
                            value={`${cvh.version}`}
                            onChange={(e) => selectVersion(e)}
                          />
                          <label
                            className="govuk-label govuk-checkboxes__label"
                            htmlFor="provider-approval"
                          ></label>
                        </div>
                      </th>
                      <td className="govuk-table__cell">{cvh.publishStatus}</td>
                      <td className="govuk-table__cell">{cvh.version}</td>
                      <td className="govuk-table__cell">
                        <DateTimeFormatter date={cvh.lastUpdated} />
                      </td>
                      <td className="govuk-table__cell">{cvh.author.name}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <button
              id={"compare-button"}
              data-prevent-double-click="true"
              className="govuk-button"
              data-module="govuk-button"
              disabled={disableCompare}
              onClick={compareVersions}
            >
              Compare calculations
            </button>
          </div>
        </div>
        <BackLink to={`/Specifications/EditCalculation/${calculationId}`} />
      </div>
      <Footer />
    </div>
  );
}
