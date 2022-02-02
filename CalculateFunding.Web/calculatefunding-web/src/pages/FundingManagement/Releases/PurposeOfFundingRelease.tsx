import React, { useState } from "react";
import { RouteComponentProps, useHistory } from "react-router";
import { Link } from "react-router-dom";

import { Breadcrumb, Breadcrumbs } from "../../../components/Breadcrumbs";
import { FundingSelectionBreadcrumb } from "../../../components/Funding/FundingSelectionBreadcrumb";
import { LoadingStatusNotifier } from "../../../components/LoadingStatusNotifier";
import { Main } from "../../../components/Main";
import { MultipleErrorSummary } from "../../../components/MultipleErrorSummary";
import { useErrors } from "../../../hooks/useErrors";
import { useFundingConfiguration } from "../../../hooks/useFundingConfiguration";
import { useSpecificationSummary } from "../../../hooks/useSpecificationSummary";
import { ReleaseChannel } from "../../../types/FundingConfiguration";
import { FundingActionType } from "../../../types/PublishedProvider/PublishedProviderFundingCount";
import { Section } from "../../../types/Sections";

export interface FundingManagementReleasePurposeProps {
  fundingStreamId: string;
  fundingPeriodId: string;
  specificationId: string;
}

export const PurposeOfFundingRelease = ({
  match,
}: RouteComponentProps<FundingManagementReleasePurposeProps>) => {
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
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
              <MultipleErrorSummary errors={errors} />
              <h1 className="govuk-heading-l">For which purposes would you like to release?</h1>
              <h2 className="govuk-caption-m">Select all that apply.</h2>
            </div>
          </div>

          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
              <div className="govuk-checkboxes">
                {fundingConfiguration?.releaseChannels
                  ?.filter((rc) => !!rc.isVisible)
                  ?.map((rac, index) => (
                    <div key={index} className="govuk-checkboxes__item">
                      <input
                        type="checkbox"
                        className="govuk-checkboxes__input"
                        onChange={(e) => setReleaseAction(e, rac)}
                      />
                      <label className="govuk-label govuk-checkboxes__label">{rac.channelCode} </label>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div className="govuk-grid-row govuk-!-padding-top-9">
            <div className="govuk-grid-column-full">
              <button className="govuk-button" onClick={setPurpose}>
                Continue
              </button>{" "}
              <Link className="govuk-button govuk-button--secondary" to={"/"}>
                Cancel
              </Link>
            </div>
          </div>
        </>
      )}
    </Main>
  );
};
