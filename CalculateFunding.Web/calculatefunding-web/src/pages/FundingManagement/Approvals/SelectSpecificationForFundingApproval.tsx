import { Main } from "components/Main";
import React, { useState } from "react";
import { useHistory } from "react-router";

import { Breadcrumb, Breadcrumbs } from "../../../components/Breadcrumbs";
import { LoadingFieldStatus } from "../../../components/LoadingFieldStatus";
import { MultipleErrorSummary } from "../../../components/MultipleErrorSummary";
import { Title } from "../../../components/Title";
import { useOptionsForSpecificationsSelectedForFunding } from "../../../hooks/FundingApproval/useOptionsForSpecificationsSelectedForFunding";
import { useErrors } from "../../../hooks/useErrors";
import { useFundingConfiguration } from "../../../hooks/useFundingConfiguration";
import { ApprovalMode } from "../../../types/ApprovalMode";
import { Section } from "../../../types/Sections";
import {
  FundingPeriodWithSpecificationSelectedForFunding,
  FundingStreamWithSpecificationSelectedForFunding,
} from "../../../types/SpecificationSelectedForFunding";

export function SelectSpecificationForFundingApproval(): JSX.Element {
  const [selectedFundingStream, setSelectedFundingStream] =
    useState<FundingStreamWithSpecificationSelectedForFunding>();
  const [selectedFundingPeriod, setSelectedFundingPeriod] =
    useState<FundingPeriodWithSpecificationSelectedForFunding>();
  const [batchUpload, setBatchUpload] = useState<boolean | undefined>(false);
  const history = useHistory();
  const { fundingStreams, isLoadingOptions, isErrorCheckingForOptions } =
    useOptionsForSpecificationsSelectedForFunding({
      onError: (err) => addError({ error: err, description: "Error while loading selections" }),
    });
  const { errors, addError, clearErrorMessages } = useErrors();
  const { fundingConfiguration, isLoadingFundingConfiguration } = useFundingConfiguration(
    selectedFundingStream?.id,
    selectedFundingPeriod?.id,
    (err) => addError({ error: err, description: "Error while loading funding configuration" })
  );

  const changeFundingStream = (e: React.ChangeEvent<HTMLSelectElement>) => {
    clearErrorMessages();
    if (fundingStreams) {
      setSelectedFundingStream(fundingStreams.find((stream) => stream.id === e.target.value));
      setSelectedFundingPeriod(undefined);
    }
  };

  const changeFundingPeriod = (e: React.ChangeEvent<HTMLSelectElement>) => {
    clearErrorMessages();
    if (selectedFundingStream) {
      setSelectedFundingPeriod(selectedFundingStream.periods.find((period) => period.id === e.target.value));
    }
  };

  const proceedToNextStep = () => {
    if (
      !selectedFundingStream ||
      !selectedFundingPeriod ||
      !fundingConfiguration ||
      (fundingConfiguration.approvalMode === ApprovalMode.Batches && batchUpload === undefined)
    )
      return;

    history.push(
      batchUpload
        ? `/FundingManagement/Approve/UploadBatch/${selectedFundingStream.id}/${selectedFundingPeriod.id}/${selectedFundingPeriod.specifications[0].id}`
        : `/FundingManagement/Approve/Results/${selectedFundingStream.id}/${selectedFundingPeriod.id}/${selectedFundingPeriod.specifications[0].id}`
    );
  };

  return (
    <Main location={Section.FundingManagement}>
      <Breadcrumbs>
        <Breadcrumb name={"Calculate funding"} url={"/"} />
        <Breadcrumb name={"Funding management"} url={"/FundingManagement"} />
      </Breadcrumbs>
      <MultipleErrorSummary errors={errors} />

      <Title title={"Funding approvals"} titleCaption={"Select a funding stream and funding period."} />

      <section className="govuk-grid-row govuk-!-margin-top-6 govuk-!-margin-bottom-6">
        <div className="govuk-grid-column-full">
          {!isErrorCheckingForOptions && (
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="sort">
                Funding stream
              </label>
              {!isLoadingOptions && fundingStreams && fundingStreams.length > 0 ? (
                <select
                  className="govuk-select"
                  id="funding-streams"
                  name="sort"
                  onChange={changeFundingStream}
                  data-testid={"funding-stream-dropdown"}
                >
                  <option>Please select</option>
                  {fundingStreams.map((fs, index) => (
                    <option key={index} value={fs.id}>
                      {fs.name}
                    </option>
                  ))}
                </select>
              ) : (
                <LoadingFieldStatus title={"Loading..."} />
              )}
            </div>
          )}
          {!isLoadingOptions && selectedFundingStream && (
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="sort">
                Funding period
              </label>
              <select
                className="govuk-select"
                id="funding-periods"
                data-testid={"funding-period-dropdown"}
                onChange={changeFundingPeriod}
              >
                <option>Please select</option>
                {selectedFundingStream.periods.map((fp, index) => (
                  <option key={index} value={fp.id}>
                    {fp.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {selectedFundingStream && selectedFundingPeriod && selectedFundingPeriod.specifications.length > 0 && (
            <>
              {isLoadingFundingConfiguration && <LoadingFieldStatus title="Checking for approval mode..." />}
              {!isLoadingFundingConfiguration && fundingConfiguration && fundingConfiguration.approvalMode && (
                <>
                  {fundingConfiguration.approvalMode === ApprovalMode.Batches && (
                    <div className="govuk-radios govuk-radios--inline">
                      <label className="govuk-label govuk-!-margin-bottom-2" htmlFor="file-upload-1">
                        Select yes if you wish to approve a preselected batch of providers
                      </label>
                      <div className="govuk-radios__item">
                        <input
                          className="govuk-radios__input"
                          id="yesUpload"
                          name="yesUpload"
                          aria-label="Approve using an upload of selected providers"
                          checked={batchUpload === true}
                          onChange={() => setBatchUpload(true)}
                          type="radio"
                        />
                        <label className="govuk-label govuk-radios__label" htmlFor="yesUpload">
                          Yes
                        </label>
                      </div>
                      <div className="govuk-radios__item govuk-!-margin-bottom-7">
                        <input
                          className="govuk-radios__input"
                          id="noUpload"
                          name="noUpload"
                          aria-label="Approve without an upload"
                          checked={batchUpload === false}
                          onChange={() => setBatchUpload(false)}
                          type="radio"
                        />
                        <label className="govuk-label govuk-radios__label" htmlFor="noUpload">
                          No
                        </label>
                      </div>
                    </div>
                  )}
                  <div className="govuk-form-group">
                    <label className="govuk-label">Specification</label>
                    <p className="govuk-heading-s">{selectedFundingPeriod.specifications[0].name}</p>
                    <button
                      className="govuk-button"
                      type="button"
                      data-module="govuk-button"
                      aria-controls="navigation"
                      aria-label="Continue to upload page"
                      disabled={
                        !selectedFundingStream ||
                        !selectedFundingPeriod ||
                        (fundingConfiguration.approvalMode === ApprovalMode.Batches &&
                          batchUpload === undefined)
                      }
                      onClick={proceedToNextStep}
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>
    </Main>
  );
}
