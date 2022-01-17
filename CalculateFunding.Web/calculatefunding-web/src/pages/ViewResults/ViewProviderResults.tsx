import { AxiosError } from "axios";
import * as QueryString from "query-string";
import React, { useEffect, useState } from "react";
import { RouteComponentProps, useLocation } from "react-router";

import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import { AdditionalCalculations } from "../../components/Calculations/AdditionalCalculations";
import { Footer } from "../../components/Footer";
import { ProviderDataTab } from "../../components/Funding/ProviderDataTab";
import { FundingLineResults } from "../../components/fundingLineStructure/FundingLineResults";
import { Header } from "../../components/Header";
import { LoadingStatus } from "../../components/LoadingStatus";
import { MultipleErrorSummary } from "../../components/MultipleErrorSummary";
import { NoData } from "../../components/NoData";
import { Tabs } from "../../components/Tabs";
import { WarningText } from "../../components/WarningText";
import { useProviderVersion } from "../../hooks/Providers/useProviderVersion";
import { useErrors } from "../../hooks/useErrors";
import { getFundingStreamByIdService } from "../../services/policyService";
import { getProviderResultsService } from "../../services/providerService";
import { getSpecificationSummaryService } from "../../services/specificationService";
import { JobType } from "../../types/jobType";
import { SpecificationInformation } from "../../types/Provider/SpecificationInformation";
import { Section } from "../../types/Sections";
import { SpecificationSummary } from "../../types/SpecificationSummary";
import { FundingStream } from "../../types/viewFundingTypes";

export interface ViewProviderResultsRouteProps {
  providerId: string;
  fundingStreamId: string;
}

export function ViewProviderResults({
  match,
}: RouteComponentProps<ViewProviderResultsRouteProps>): JSX.Element {
  const [providerResults, setProviderResults] = useState<SpecificationInformation[]>();
  const [specificationSummary, setSpecificationSummary] = useState<SpecificationSummary>();
  const [isLoadingProviderData, setIsLoadingProviderData] = useState<boolean>(true);
  const [selectedSpecificationId, setSelectedSpecificationId] = useState<string>("");
  const [defaultFundingStreamName, setDefaultFundingStreamName] = useState<string>("");
  const [refreshFundingLines, setRefreshFundingLines] = useState<boolean>(false);
  const location = useLocation();
  const { errors, addError, clearErrorMessages } = useErrors();

  const providerId = match.params.providerId;

  const { providerVersion: providerDetails, isLoadingProviderVersion } = useProviderVersion(
    providerId,
    specificationSummary && specificationSummary.providerVersionId
      ? specificationSummary.providerVersionId
      : "",
    (err: AxiosError) => addError({ error: err.message, description: "Error while loading provider" })
  );

  useEffect(() => {
    const querystringParams = QueryString.parse(location.search);

    const fetchData = async () => {
      try {
        const response = await getProviderResultsService(providerId);
        const specificationInformation = response.data;
        if (specificationInformation && specificationInformation.length > 0) {
          const specificationIdQuerystring = querystringParams.specificationId as string;
          const selectedSpecification =
            specificationInformation.find((s) => s.id === specificationIdQuerystring) ??
            specificationInformation[0];

          let specificationId = selectedSpecification.id;

          if (querystringParams.specificationId) {
            setSelectedSpecificationId(specificationIdQuerystring);
            specificationId = specificationIdQuerystring;
          } else {
            if (
              specificationInformation.some((specInformation) => specInformation.fundingStreamIds != null)
            ) {
              let selectSpecificationByFundingStream = false;
              specificationInformation.map((specInfo) => {
                return specInfo.fundingStreamIds?.map((fundingStreamId) => {
                  if (fundingStreamId === match.params.fundingStreamId) {
                    setSelectedSpecificationId(specInfo.id);
                    specificationId = specInfo.id;
                    selectSpecificationByFundingStream = true;
                    return;
                  }
                });
              });

              if (!selectSpecificationByFundingStream) {
                const fundingStreamResponse = await getFundingStreamByIdService(match.params.fundingStreamId);
                const fundingStream = fundingStreamResponse.data as FundingStream;
                setDefaultFundingStreamName(fundingStream.name);
              }
            }
          }
          populateSpecification(specificationId);
          setProviderResults(specificationInformation);
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          addError({ error: "No results found for this provider." });
        } else {
          addError({ error: err });
        }
      } finally {
        setIsLoadingProviderData(false);
      }
    };
    fetchData();
  }, []);

  function setSelectedSpecification(e: React.ChangeEvent<HTMLSelectElement>) {
    const specificationId = e.target.value;
    populateSpecification(specificationId);
  }

  function populateSpecification(specificationId: string) {
    getSpecificationSummaryService(specificationId)
      .then((response) => {
        const result = response.data as SpecificationSummary;
        setSelectedSpecificationId(result.id);
        setSpecificationSummary(response.data);
        setRefreshFundingLines(true);
      })
      .catch((e) => {
        addError({ error: e });
      })
      .finally(() => {
        setRefreshFundingLines(false);
      });
  }

  return (
    <div>
      <Header location={Section.Results} />
      <div className="govuk-width-container">
        <Breadcrumbs>
          <Breadcrumb name={"Calculate funding"} url={"/"} />
          <Breadcrumb name={"View results"} url={"/Results"} />
          <Breadcrumb
            name={"Select funding stream"}
            url={"/ViewResults/ViewProvidersFundingStreamSelection"}
          />
          <Breadcrumb name={"View provider results"} goBack={true} />
          <Breadcrumb name={providerDetails ? providerDetails.name : "Loading..."} />
        </Breadcrumbs>

        <MultipleErrorSummary errors={errors} />
        <LoadingStatus
          title={"Loading provider details"}
          hidden={!isLoadingProviderVersion && !isLoadingProviderData}
        />

        {providerDetails && (
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
              <h1 className="govuk-heading-xl govuk-!-margin-bottom-3">{providerDetails.name}</h1>
              <span className="govuk-caption-m govuk-!-margin-bottom-4">
                UKPRN: <strong>{providerDetails.ukprn}</strong>
              </span>
            </div>
          </div>
        )}

        <WarningText
          text={`There are no specifications for ${defaultFundingStreamName}`}
          hidden={defaultFundingStreamName === "" || isLoadingProviderVersion}
        />
        <NoData hidden={(specificationSummary && specificationSummary.id !== "") || true} />

        <div className="govuk-grid-row govuk-!-margin-bottom-6" hidden={isLoadingProviderVersion}>
          {specificationSummary && providerResults && (
            <div className="govuk-grid-column-two-thirds">
              <div className="govuk-form-group">
                <h3 className="govuk-heading-m govuk-!-margin-bottom-1">Specification</h3>
                <span className="govuk-caption-m govuk-!-margin-bottom-2">
                  Available specifications for all funding streams will be displayed here.
                </span>
                <select
                  className="govuk-select"
                  id="sort"
                  name="sort"
                  onChange={setSelectedSpecification}
                  value={selectedSpecificationId !== "" ? selectedSpecificationId : specificationSummary.id}
                >
                  {providerResults.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <p className="govuk-body">
                Funding stream:
                <span className="govuk-!-margin-left-2 govuk-!-font-weight-bold">
                  {specificationSummary.fundingStreams[0].name}
                </span>
              </p>
              <p className="govuk-body">
                Funding period:
                <span className="govuk-!-margin-left-2 govuk-!-font-weight-bold">
                  {specificationSummary.fundingPeriod.name}
                </span>
              </p>
            </div>
          )}
        </div>
        <div className="govuk-grid-row" hidden={isLoadingProviderVersion || isLoadingProviderData}>
          <div className="govuk-grid-column-full">
            <Tabs initialTab={"funding-line-structure"}>
              <ul className="govuk-tabs__list">
                <Tabs.Tab label="funding-line-structure">Funding line structure</Tabs.Tab>
                <Tabs.Tab label="additional-calculations">Additional calculations</Tabs.Tab>
                <Tabs.Tab label="provider-data">Provider data</Tabs.Tab>
              </ul>
              <Tabs.Panel label={"funding-line-structure"}>
                {specificationSummary && (
                  <FundingLineResults
                    specification={specificationSummary}
                    providerId={providerId}
                    addError={addError}
                    clearErrorMessages={clearErrorMessages}
                    refreshFundingLines={refreshFundingLines}
                    jobTypes={[JobType.AssignTemplateCalculationsJob]}
                  />
                )}
              </Tabs.Panel>
              <Tabs.Panel label="additional-calculations">
                {specificationSummary && (
                  <AdditionalCalculations
                    specificationId={specificationSummary.id}
                    providerId={providerId}
                    addError={addError}
                    showCreateButton={false}
                  />
                )}
              </Tabs.Panel>
              <Tabs.Panel label={"provider-data"}>
                <ProviderDataTab
                  providerId={providerId}
                  providerVersionId={providerDetails?.providerVersionId}
                />
              </Tabs.Panel>
            </Tabs>
          </div>
        </div>
      </div>
      &nbsp;
      <Footer />
    </div>
  );
}
