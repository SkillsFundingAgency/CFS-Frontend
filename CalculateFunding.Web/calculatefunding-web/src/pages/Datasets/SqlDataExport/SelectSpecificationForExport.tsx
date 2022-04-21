import React from "react";
import { Link } from "react-router-dom";

import { Breadcrumb, Breadcrumbs } from "../../../components/Breadcrumbs";
import { LoadingFieldStatus } from "../../../components/LoadingFieldStatus";
import { Main } from "../../../components/Main";
import { MultipleErrorSummary } from "../../../components/MultipleErrorSummary";
import { Title } from "../../../components/Title";
import { useSpecificationWithResultsSelection } from "../../../hooks/SelectSpecification/useSpecificationWithResultsSelection";
import { useErrors } from "../../../hooks/useErrors";
import { Section } from "../../../types/Sections";

export const SelectSpecificationForExport = (): JSX.Element => {
  const { errors, addError, clearErrorMessages } = useErrors();
  const {
    fundingStreams,
    isLoadingFundingStreams,
    selectedFundingStreamId,
    setSelectedFundingStreamId,
    fundingPeriods,
    isLoadingFundingPeriods,
    selectedFundingPeriodId,
    setSelectedFundingPeriodId,
    specificationsWithResults,
    isLoadingSpecificationsWithResults,
    hasFetchedSpecificationsWithResults,
    selectedSpecificationId,
    setSelectedSpecificationId,
  } = useSpecificationWithResultsSelection(addError, clearErrorMessages);

  document.title = "Export to SQL - Select funding stream, period and specification - Calculate Funding";

  function onFundingStreamSelection(event: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedFundingStreamId(event.target.value);
  }

  function onFundingPeriodSelection(event: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedFundingPeriodId(event.target.value);
  }

  function onSpecificationSelection(event: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedSpecificationId(event.target.value);
  }

  return (
    <Main location={Section.Results}>
      <Breadcrumbs>
        <Breadcrumb name="Home" url="/" />
        <Breadcrumb name="Manage data" url="/Datasets/ManageData" />
      </Breadcrumbs>

      <MultipleErrorSummary errors={errors} />

      <Title title="Which funding stream, period and specification?" />

      {!!fundingStreams && (
        <fieldset className="govuk-fieldset">
          <div className="govuk-form-group">
            <label id="select-funding-stream-label" htmlFor="select-funding-stream" className="govuk-label">
              Funding stream
            </label>
            <select
              id="select-funding-stream"
              aria-labelledby="select-funding-stream-label"
              className="govuk-select"
              disabled={!fundingStreams?.length}
              onChange={onFundingStreamSelection}
            >
              <option>Please select a funding stream</option>
              {fundingStreams?.map((fs) => (
                <option key={fs.id} value={fs.id}>
                  {fs.name}
                </option>
              ))}
            </select>
          </div>
        </fieldset>
      )}

      {isLoadingFundingStreams && <LoadingFieldStatus title="Loading funding streams" />}
      {isLoadingFundingPeriods && <LoadingFieldStatus title="Loading funding periods" />}

      {!!fundingPeriods && (
        <fieldset className="govuk-fieldset">
          <div className="govuk-form-group">
            <label htmlFor="select-period" className="govuk-label">
              Funding period
            </label>
            <select
              id="select-period"
              className="govuk-select"
              placeholder="Please select"
              disabled={!fundingPeriods?.length}
              onChange={onFundingPeriodSelection}
            >
              <option>Please select a funding period</option>
              {fundingPeriods?.map((fp) => (
                <option key={fp.id} value={fp.id}>
                  {fp.name}
                </option>
              ))}
            </select>
          </div>
        </fieldset>
      )}

      {isLoadingSpecificationsWithResults && <LoadingFieldStatus title="Loading specifications" />}

      {!specificationsWithResults?.length &&
        selectedFundingPeriodId &&
        selectedFundingStreamId &&
        !isLoadingSpecificationsWithResults &&
        hasFetchedSpecificationsWithResults && (
          <div className="govuk-form-group">
            <label className="govuk-label">Specification</label>
            <div className="govuk-error-summary">
              <span className="govuk-body-m">There are no specifications available for the selection</span>
            </div>
          </div>
        )}

      {!!specificationsWithResults?.length && (
        <fieldset className="govuk-fieldset">
          <div className="govuk-form-group">
            <label htmlFor="select-spec" className="govuk-label">
              Specification
            </label>
            <select
              id="select-spec"
              className="govuk-select"
              placeholder="Please select"
              disabled={specificationsWithResults.length === 0}
              onChange={onSpecificationSelection}
            >
              <option key={""} value={""}>
                Please select a specification
              </option>
              {specificationsWithResults
                .sort((a, b) => Number(a.isSelectedForFunding) - Number(b.isSelectedForFunding))
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.isSelectedForFunding ? "(Chosen for funding)" : ""}
                  </option>
                ))}
            </select>
          </div>
        </fieldset>
      )}

      {!!selectedSpecificationId?.length && (
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <Link
              to={`/Datasets/Export/RunExportToSql/${selectedSpecificationId}`}
              className="govuk-button"
              role="button"
              data-module="govuk-button"
            >
              Continue
            </Link>
          </div>
        </div>
      )}
    </Main>
  );
};
