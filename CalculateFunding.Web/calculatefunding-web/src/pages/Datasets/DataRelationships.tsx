import { AxiosError } from "axios";
import React, { useEffect, useMemo } from "react";
import { useQuery } from "react-query";
import { useSelector } from "react-redux";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";

import { BackToTop } from "../../components/BackToTop";
import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import SpecificationDataRelationshipsGrid from "../../components/Datasets/SpecificationDataRelationshipsGrid";
import { Main } from "../../components/Main";
import { MultipleErrorSummary } from "../../components/MultipleErrorSummary";
import { TextLink } from "../../components/TextLink";
import { Title } from "../../components/Title";
import { useJobSubscription } from "../../hooks/Jobs/useJobSubscription";
import { useErrors } from "../../hooks/useErrors";
import { IStoreState } from "../../reducers/rootReducer";
import { getDatasetRelationshipsBySpec } from "../../services/datasetService";
import { FeatureFlagsState } from "../../states/FeatureFlagsState";
import { SpecificationDatasetRelationshipsViewModel } from "../../types/Datasets/SpecificationDatasetRelationshipsViewModel";
import { JobType } from "../../types/jobType";
import { Section } from "../../types/Sections";

export interface DataRelationshipsRouteProps {
  specificationId: string;
}

export function DataRelationships({ match }: RouteComponentProps<DataRelationshipsRouteProps>) {
  const specificationId = match.params.specificationId;
  const { data: datasetRelationships, isLoading } = useQuery<
    SpecificationDatasetRelationshipsViewModel,
    AxiosError
  >(
    `spec-${specificationId}-dataset-relationships`,
    async () => (await getDatasetRelationshipsBySpec(specificationId)).data,
    {
      enabled: !!specificationId,
      onError: (err) =>
        addError({
          error: err,
          description: "Error while fetching dataset relationships",
          suggestion: "Please try again later",
        }),
    }
  );
  const {
    addSub,
    removeAllSubs,
    results: jobNotifications,
  } = useJobSubscription({
    onError: (err) =>
      addError({ error: err, description: "An error occurred while monitoring the running jobs" }),
  });
  const converterWizardJobs = useMemo(
    () => jobNotifications.filter((n) => n.latestJob?.jobType === JobType.RunConverterDatasetMergeJob),
    [jobNotifications]
  );
  const { errors, addError } = useErrors();
  const featureFlagsState: FeatureFlagsState = useSelector<IStoreState, FeatureFlagsState>(
    (state) => state.featureFlags
  );

  const watchConverterWizardJobForRelationship = (specificationId: string, triggerByEntityId: string) => {
    if (specificationId?.length && triggerByEntityId?.length) {
      addSub({
        filterBy: {
          specificationId: match.params.specificationId,
          triggerByEntityId: triggerByEntityId,
          jobTypes: [JobType.RunConverterDatasetMergeJob],
        },
        onError: (err) =>
          addError({
            error: err,
            description: "Error while checking for converter wizard running jobs",
          }),
      });
    }
  };

  useEffect(() => {
    if (!datasetRelationships?.items.length) return;

    datasetRelationships.items.forEach((relationship) => {
      watchConverterWizardJobForRelationship(match.params.specificationId, relationship.relationshipId);
    });
  }, [match.params.specificationId, datasetRelationships]);

  useEffect(() => () => removeAllSubs(), []);

  const specificationName = datasetRelationships?.specification?.name || "";
  const fundingPeriodName = datasetRelationships?.specification?.fundingPeriod?.name || "";

  return (
    <Main location={Section.Datasets}>
      <Breadcrumbs>
        <Breadcrumb name="Home" url="/" />
        <Breadcrumb name={"Manage data"} url={"/Datasets/ManageData"} />
        <Breadcrumb
          name={"Map data sources to datasets for a specification"}
          url={"/Datasets/MapDataSourceFiles"}
        />
      </Breadcrumbs>
      <MultipleErrorSummary errors={errors} />

      <Title title={specificationName}>
        <span className="govuk-caption-xl">{fundingPeriodName}</span>
      </Title>

      <section>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <AddDataRelationshipButton
              specificationId={specificationId}
              specToSpec={featureFlagsState.specToSpec}
            />
          </div>
          <div className="govuk-grid-column-one-third">
            <ul className="govuk-list right-align">
              <li>
                <TextLink to={`/ViewSpecification/${specificationId}`}>Manage specification</TextLink>
              </li>
            </ul>
          </div>
        </div>

        <SpecificationDataRelationshipsGrid
          isLoadingDatasetRelationships={isLoading}
          datasetRelationships={datasetRelationships?.items || []}
          converterWizardJobs={converterWizardJobs}
        />

        <div className="govuk-grid-row govuk-!-margin-bottom-4 govuk-!-margin-top-0">
          <div className="govuk-grid-column-full">
            <BackToTop id={"top"} />
          </div>
        </div>
      </section>
    </Main>
  );
}

const AddDataRelationshipButton = React.memo((props: { specificationId: string; specToSpec: boolean }) => {
  return (
    <Link
      id={"create-dataset-link"}
      to={
        props.specToSpec
          ? `/Datasets/Create/SelectDatasetTypeToCreate/${props.specificationId}`
          : `/Datasets/CreateDataset/${props.specificationId}`
      }
      className="govuk-button govuk-button--primary button-createSpecification govuk-!-margin-top-4"
      data-module="govuk-button"
    >
      Add new data set
    </Link>
  );
});
