import React, { useState } from "react";
import { useHistory } from "react-router";

import { AutoComplete } from "../../components/AutoComplete";
import { BackLink } from "../../components/BackLink";
import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import { LoadingFieldStatus } from "../../components/LoadingFieldStatus";
import { LoadingStatus } from "../../components/LoadingStatus";
import { Main } from "../../components/Main";
import { MultipleErrorSummary } from "../../components/MultipleErrorSummary";
import { useErrors } from "../../hooks/useErrors";
import { useFundingStreams } from "../../hooks/useFundingStreams";
import { Section } from "../../types/Sections";
import { FundingStream } from "../../types/viewFundingTypes";

export function ViewProvidersFundingStreamSelection() {
  const { errors, addError } = useErrors();
  const [selectedFundingStream, setSelectedFundingStream] = useState<FundingStream | undefined>();
  const [isFormValid, setIsFormValid] = useState<boolean>(true);
  const history = useHistory();

  const { fundingStreams, isLoadingFundingStreams } = useFundingStreams(false, {
    onError: (err) => addError({ error: err, description: "Error while getting funding streams" }),
  });

  function updateFundingStreamSelection(e: string) {
    if (!fundingStreams) return;

    const result = fundingStreams.filter((x) => x.name === e)[0];
    if (result) {
      setSelectedFundingStream(result);
      setIsFormValid(true);
    } else {
      setSelectedFundingStream(undefined);
    }
  }

  function submit() {
    if (selectedFundingStream) {
      history.push(`/viewresults/ViewProvidersByFundingStream/${selectedFundingStream.id}`);
    } else {
      setIsFormValid(false);
    }
  }

  return (
    <Main location={Section.Results}>
      <Breadcrumbs>
        <Breadcrumb name={"Calculate funding"} url={"/"} />
        <Breadcrumb name={"View results"} url={"/results"} />
        <Breadcrumb name={"Select funding stream"} />
      </Breadcrumbs>
      <MultipleErrorSummary errors={errors} />
      <LoadingStatus
        title={"Loading funding streams"}
        description={"Please wait whilst funding streams are loading"}
        hidden={!isLoadingFundingStreams}
      />
      {!isLoadingFundingStreams && (
        <div className="govuk-main-wrapper">
          <div className={"govuk-form-group" + (!isFormValid ? " govuk-form-group--error" : "")}>
            <fieldset className="govuk-fieldset">
              <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">Select funding stream</h1>
                <span className="govuk-caption-xl govuk-!-margin-bottom-6">
                  Select the funding you wish to view providers for
                </span>
              </legend>
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-third">
                  <label className="govuk-label">Select a funding stream</label>
                  {isLoadingFundingStreams || !fundingStreams ? (
                    <div className="loader-inline">
                      <LoadingFieldStatus title="loading funding streams" />
                    </div>
                  ) : (
                    <AutoComplete
                      suggestions={fundingStreams.map((fs) => fs.name)}
                      callback={updateFundingStreamSelection}
                      disabled={isLoadingFundingStreams}
                    />
                  )}
                  {!isFormValid && (
                    <span className="govuk-error-message govuk-!-margin-bottom-1">
                      <span data-testid="validation-error" className="govuk-visually-hidden">
                        Error:
                      </span>{" "}
                      Select a funding stream
                    </span>
                  )}
                </div>
              </div>
            </fieldset>
          </div>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-third">
              <button className="govuk-button" type="button" aria-label="Continue" onClick={submit}>
                Continue
              </button>
            </div>
          </div>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-third">
              <BackLink />
            </div>
          </div>
        </div>
      )}
    </Main>
  );
}
