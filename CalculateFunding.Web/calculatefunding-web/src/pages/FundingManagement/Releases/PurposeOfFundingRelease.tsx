import React, { useState } from "react";
import { RouteComponentProps, useHistory } from "react-router";

import { Breadcrumb, Breadcrumbs } from "../../../components/Breadcrumbs";
import { FundingSelectionBreadcrumb } from "../../../components/Funding/FundingSelectionBreadcrumb";
import { LoadingStatusNotifier } from "../../../components/LoadingStatusNotifier";
import { Main } from "../../../components/Main";
import { MultipleErrorSummary } from "../../../components/MultipleErrorSummary";
import { Title } from "../../../components/Title";
import { WarningText } from "../../../components/WarningText";
import { useErrors } from "../../../hooks/useErrors";
import { useFundingConfiguration } from "../../../hooks/useFundingConfiguration";
import { useSpecificationSummary } from "../../../hooks/useSpecificationSummary";
import { ReleaseChannel } from "../../../types/FundingConfiguration";
import { FundingActionType } from "../../../types/PublishedProvider/PublishedProviderFundingCount";
import { Section } from "../../../types/Sections";

export interface PurposeOfFundingReleaseProps {
  fundingStreamId: string;
  fundingPeriodId: string;
  specificationId: string;
}

export const PurposeOfFundingRelease = ({ match }: RouteComponentProps<PurposeOfFundingReleaseProps>) => {
  const history = useHistory();
  const { fundingStreamId, fundingPeriodId, specificationId } = match.params;

  const [releaseActions, setReleaseActions] = useState<ReleaseChannel[]>([]);

  const { errors, addError, clearErrorMessages } = useErrors();

  const { specification, isLoadingSpecification } = useSpecificationSummary(specificationId, (err) =>
    addError({ error: err, description: "Error while loading specification" })
  );

  const { fundingConfiguration, isLoadingFundingConfiguration } = useFundingConfiguration(
    fundingStreamId,
    fundingPeriodId,
    (err) => addError({ error: err, description: "Error while loading funding configuration" })
  );

  function setPurpose() {
    clearErrorMessages();
    if (releaseActions && releaseActions?.length < 1) {
      addError({ error: "Please select a release type" });
    } else {
      history.push(
        `/FundingManagement/Release/Confirm/${fundingStreamId}/${fundingPeriodId}/${specificationId}/?${releaseActions
          .map((r) => `purposes=${r.channelCode}`)
          .join("&")}`
      );
    }
  }

  function setReleaseAction(e: React.ChangeEvent<HTMLInputElement>, rac: ReleaseChannel) {
    if (e.target.checked) {
      setReleaseActions((prevState) => [...prevState, rac]);
    } else {
      setReleaseActions(releaseActions.filter((x) => x.channelCode !== rac.channelCode));
    }
  }

  const releaseChannels = fundingConfiguration?.releaseChannels?.filter((rc) => !!rc.isVisible) ?? [];

  return (
    <Main location={Section.FundingManagement}>
      {!isLoadingFundingConfiguration && !isLoadingSpecification && (
        <Breadcrumbs>
          <Breadcrumb name="Calculate funding" url="/" />
          <Breadcrumb name="Funding management" url="/FundingManagement" />
          <FundingSelectionBreadcrumb actionType={FundingActionType.Release} />
          <Breadcrumb
            name={`${specification?.name}`}
            url={`/FundingManagement/Release/Results/${fundingStreamId}/${fundingPeriodId}/${specificationId}`}
          />
          <Breadcrumb name="Release purpose" />
        </Breadcrumbs>
      )}
      <MultipleErrorSummary errors={errors} />

      {isLoadingFundingConfiguration && isLoadingSpecification ? (
        <LoadingStatusNotifier
          notifications={[
            {
              title: "Loading specification",
              isActive: isLoadingSpecification,
            },
            {
              title: "Loading funding configuration",
              isActive: isLoadingFundingConfiguration,
            },
          ]}
        />
      ) : (
        <>
          <Title
            title={"For which purposes would you like to release?"}
            titleCaption={"Select all that apply."}
          />

          {!releaseChannels.length ? (
            <WarningText text="There are no release purposes configured for the selected funding stream and funding period." />
          ) : (
            <>
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                  <div className="govuk-checkboxes">
                    {releaseChannels.map((rac, index) => (
                      <div key={index} className="govuk-checkboxes__item">
                        <input
                          type="checkbox"
                          className="govuk-checkboxes__input"
                          aria-labelledby={`channel-${rac.channelCode}`}
                          onChange={(e) => setReleaseAction(e, rac)}
                        />
                        <label
                          id={`channel-${rac.channelCode}`}
                          className="govuk-label govuk-checkboxes__label"
                        >
                          {rac.channelCode}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="govuk-grid-row govuk-!-padding-top-9">
            <div className="govuk-grid-column-full">
              <button className="govuk-button" onClick={setPurpose} hidden={!releaseChannels.length}>
                Continue
              </button>{" "}
              <button className="govuk-button govuk-button--secondary" onClick={history.goBack}>
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </Main>
  );
};
