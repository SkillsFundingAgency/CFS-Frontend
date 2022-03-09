import * as React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import { LoadingFieldStatus } from "../../components/LoadingFieldStatus";
import { Main } from "../../components/Main";
import { MultipleErrorSummary } from "../../components/MultipleErrorSummary";
import { Title } from "../../components/Title";
import { useErrors } from "../../hooks/useErrors";
import { useFundingPeriodsByFundingStreamId } from "../../hooks/useFundingPeriodsByFundingStreamId";
import { useFundingStreams } from "../../hooks/useFundingStreams";
import { Section } from "../../types/Sections";

export function SelectConfiguration() {
  const { fundingStreams, isLoadingFundingStreams } = useFundingStreams(true);
  const [selectedFundingStreamId, setSelectedFundingStreamId] = useState<string | undefined>();
  const [selectedFundingPeriodId, setSelectedFundingPeriodId] = useState<string | undefined>();

  document.title = "Select configuration - Calculate funding";

  const { errors, addError, clearErrorMessages } = useErrors();

  const { fundingPeriods, isLoadingFundingPeriods } = useFundingPeriodsByFundingStreamId(
    selectedFundingStreamId,
    {
      onError: (err) =>
        err.response?.status !== 404 &&
        addError({
          error: err,
          description: "No funding periods exist for your selection",
          fieldName: "funding-period",
        }),
      onSettled: (data) =>
        !data || data.length === 0
          ? addError({ error: "No funding periods exist for your selection", fieldName: "funding-period" })
          : clearErrorMessages(["funding-period"]),
    }
  );

  function updateFundingPeriods(event: React.ChangeEvent<HTMLSelectElement>) {
    const filter = event.target.value;
    clearErrorMessages(["funding-period"]);
    setSelectedFundingPeriodId(undefined);
    setSelectedFundingStreamId(filter);
  }

  function setFundingPeriod(event: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedFundingPeriodId(event.target.value);
  }

  return (
    <Main location={Section.Datasets}>
      <Breadcrumbs>
        <Breadcrumb name="Calculate funding" url="/" />
        <Breadcrumb name="Manage data" url="/Datasets/ManageData" />
      </Breadcrumbs>

      <MultipleErrorSummary errors={errors} />

      <Title
        title="Funding configuration"
        titleCaption="Select a funding stream and period to download JSON configuration files"
      />

      <fieldset className="govuk-fieldset">
        <div className="govuk-form-group">
          <label htmlFor="select-funding-stream" className="govuk-label">
            Funding stream
          </label>
          <select
            id="select-funding-stream"
            className="govuk-select"
            disabled={isLoadingFundingStreams || !fundingStreams || fundingStreams.length === 0}
            onChange={(e) => {
              updateFundingPeriods(e);
            }}
          >
            <option>Please select a funding stream</option>
            {!isLoadingFundingStreams &&
              fundingStreams &&
              fundingStreams.map((fs) => (
                <option key={fs.id} value={fs.id}>
                  {fs.name}
                </option>
              ))}
          </select>
        </div>
      </fieldset>
      <fieldset className="govuk-fieldset">
        <div
          className={`govuk-form-group ${
            errors.filter((e) => e.fieldName === "funding-period").length > 0 ? "govuk-form-group--error" : ""
          }`}
        >
          <label htmlFor="select-funding-period" className="govuk-label">
            Funding period
          </label>
          <select
            id="select-funding-period"
            className="govuk-select"
            placeholder="Please select"
            disabled={isLoadingFundingPeriods || !fundingPeriods || fundingPeriods.length === 0}
            onChange={(e) => {
              setFundingPeriod(e);
            }}
          >
            <option value="">Please select a funding period</option>
            {!isLoadingFundingPeriods &&
              fundingPeriods &&
              fundingPeriods.map((fp) => (
                <option key={fp.id} value={fp.id}>
                  {fp.name}
                </option>
              ))}
          </select>
          {isLoadingFundingPeriods && <LoadingFieldStatus title="Loading..." />}
        </div>
      </fieldset>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Link
            to={
              !selectedFundingPeriodId || selectedFundingPeriodId === ""
                ? "#"
                : `/Configuration/ConfigurationDownloads/${selectedFundingStreamId}/${selectedFundingPeriodId}`
            }
            role="button"
            className={`govuk-button ${
              !selectedFundingPeriodId || selectedFundingPeriodId === "" ? "govuk-button--disabled" : ""
            }`}
          >
            Continue
          </Link>
        </div>
      </div>
    </Main>
  );
}
