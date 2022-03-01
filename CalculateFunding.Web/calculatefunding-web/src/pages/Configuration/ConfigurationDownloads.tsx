import { AxiosError } from "axios";
import React from "react";
import { useQuery } from "react-query";
import { RouteComponentProps } from "react-router";

import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import { LoadingFieldStatus } from "../../components/LoadingFieldStatus";
import { Main } from "../../components/Main";
import { MultipleErrorSummary } from "../../components/MultipleErrorSummary";
import { Title } from "../../components/Title";
import { useErrors } from "../../hooks/useErrors";
import { getAllProfilePatterns } from "../../services/profilingService";
import { FundingStreamPeriodProfilePattern } from "../../types/ProviderProfileTotalsForStreamAndPeriod";
import { Section } from "../../types/Sections";

export interface ConfigurationDownloadsRouteProps {
  fundingStreamId: string;
  fundingPeriodId: string;
}

export function ConfigurationDownloads({ match }: RouteComponentProps<ConfigurationDownloadsRouteProps>) {
  const { errors, addError, clearErrorMessages } = useErrors();
  const fundingStreamId = match.params.fundingStreamId;
  const fundingPeriodId = match.params.fundingPeriodId;

  document.title = "Configuration downloads - Calculate funding";

  const { data: profilePatterns, isFetching: isFetchingProfilePatterns } = useQuery<
    FundingStreamPeriodProfilePattern[],
    AxiosError
  >(
    `profile-patterns-${fundingStreamId}-${fundingPeriodId}`,
    async () => (await getAllProfilePatterns(fundingStreamId, fundingPeriodId)).data,
    {
      onError: (err) => addError({ error: err, description: "Error while loading profile patterns" }),
      onSuccess: () => clearErrorMessages(),
      refetchOnWindowFocus: false,
    }
  );

  return (
    <Main location={Section.Datasets}>
      <Breadcrumbs>
        <Breadcrumb name="Calculate funding" url="/" />
        <Breadcrumb name="Manage data" url="/Datasets/ManageData" />
        <Breadcrumb name="Select configuration" url="/Configuration/SelectConfiguration" />
      </Breadcrumbs>

      <MultipleErrorSummary errors={errors} />

      <Title title="JSON data" titleCaption={`${fundingStreamId} ${fundingPeriodId}`} />

      <h2 className="govuk-heading-m">Funding configuration</h2>
      <p className="govuk-body">
        <a
          className="govuk-link govuk-link--no-visited-state"
          href={`/api/policy/configuration/${fundingStreamId}/${fundingPeriodId}/download-file`}
          download
        >
          Funding configuration
        </a>
      </p>

      <h2 className="govuk-heading-m">Funding line patterns</h2>

      <LoadingFieldStatus title="Loading funding line patterns" hidden={!isFetchingProfilePatterns} />
      {profilePatterns &&
        profilePatterns.map((s) => {
          const profilePatternKeyString = s.profilePatternKey
            ? `/profilePatternKey/${s.profilePatternKey}`
            : "";

          return (
            <div key={s.id} className="govuk-!-margin-bottom-2">
              <div className="govuk-body govuk-!-margin-bottom-0">
                <a
                  className="govuk-link govuk-link--no-visited-state"
                  href={`/api/profiling/patterns/fundingStream/${s.fundingStreamId}/fundingPeriod/${s.fundingPeriodId}/fundingLineId/${s.fundingLineId}${profilePatternKeyString}/fullpattern/download-file`}
                  download
                >
                  {s.id}
                </a>
              </div>
              <div className="govuk-body">{s.profilePatternDisplayName}</div>
            </div>
          );
        })}
    </Main>
  );
}
