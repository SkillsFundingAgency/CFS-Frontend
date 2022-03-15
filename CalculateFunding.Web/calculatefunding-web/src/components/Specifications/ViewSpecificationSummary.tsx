import * as React from "react";
import { useMemo } from "react";
import { Link } from "react-router-dom";

import { useErrorContext } from "../../context/ErrorContext";
import { milliseconds } from "../../helpers/TimeInMs";
import { useCalculationSummariesBySpecification } from "../../hooks/Calculations/useCalculationSummariesBySpecification";
import { useSpecificationPermissions } from "../../hooks/Permissions/useSpecificationPermissions";
import { useSpecificationResults } from "../../hooks/Specifications/useSpecificationResults";
import { useSpecsSelectedForFunding } from "../../hooks/Specifications/useSpecsSelectedForFunding";
import { useFeatureFlags } from "../../hooks/useFeatureFlags";
import { useFundingConfiguration } from "../../hooks/useFundingConfiguration";
import { useSpecificationSummary } from "../../hooks/useSpecificationSummary";
import * as calculationService from "../../services/calculationService";
import * as publishService from "../../services/publishService";
import * as specificationService from "../../services/specificationService";
import { CalculationType } from "../../types/CalculationSearchResponse";
import { Permission } from "../../types/Permission";
import { PublishStatus } from "../../types/PublishStatusModel";
import { ConfirmationModal } from "../ConfirmationModal";
import { Details } from "../Details";
import { LoadingFieldStatus } from "../LoadingFieldStatus";

export const ViewSpecificationSummary = ({
  specificationId,
  isLoadingSelectedForFunding,
  monitorRefreshFundingJob,
  monitorApproveAllCalculationsJob,
}: {
  specificationId: string;
  isLoadingSelectedForFunding: boolean;
  monitorRefreshFundingJob: (jobId: string) => void;
  monitorApproveAllCalculationsJob: (jobId: string) => void;
  selectedForFundingSpecId: string | undefined;
}) => {
  const {
    addErrorToContext: addError,
    addValidationErrorToContext: addValidationErrors,
    clearErrorsFromContext: clearErrorMessages,
  } = useErrorContext();

  const { specification, clearSpecificationFromCache } = useSpecificationSummary(
    specificationId,
    undefined,
    milliseconds.OneSecond
  );

  const { hasPermission, isPermissionsFetched } = useSpecificationPermissions(specificationId, [
    Permission.CanApproveSpecification,
    Permission.CanChooseFunding,
    Permission.CanApproveAllCalculations,
  ]);

  const canApproveAllCalculations: boolean = useMemo(
    () => !!(hasPermission && hasPermission(Permission.CanApproveAllCalculations)),
    [hasPermission, isPermissionsFetched]
  );

  const canChooseForFunding: boolean = useMemo(
    () => hasPermission(Permission.CanChooseFunding) === true,
    [hasPermission, isPermissionsFetched]
  );

  const { fundingConfiguration } = useFundingConfiguration(
    specification?.fundingStreams[0]?.id,
    specification?.fundingPeriod?.id,
    (err) => addError({ error: err, description: "Error while loading funding configuration" })
  );

  const { specificationHasCalculationResults, isLoadingSpecificationResults } = useSpecificationResults(
    specificationId,
    specification?.fundingStreams[0]?.id,
    specification?.fundingPeriod?.id,
    (err) => addError({ error: err, description: "Error while loading specification results" })
  );

  const { calculationSummaries, isLoadingCalculationSummaries } = useCalculationSummariesBySpecification({
    specificationId,
  });

  const { specsSelectedForFunding, isLoadingSpecsSelectedForFunding } = useSpecsSelectedForFunding(
    specification?.fundingPeriod?.id,
    specification?.fundingStreams[0]?.id
  );

  const { enableNewFundingManagement } = useFeatureFlags();

  async function chooseForFunding() {
    try {
      clearErrorMessages();
      const isAllowed: boolean = await isUserAllowedToChooseSpecification();
      if (isAllowed) {
        ConfirmationModal(
          <div className="govuk-row govuk-!-width-full">
            Are you sure you want to choose this specification?
          </div>,
          refreshFunding,
          "Confirm",
          "Cancel"
        );
      }
    } catch (e) {
      addError({ error: "A problem occurred while getting user permissions" });
    }
  }

  async function refreshFunding(confirm: boolean) {
    if (confirm) {
      try {
        const response = await publishService.refreshSpecificationFundingService(specificationId);
        const jobId = response.data as string;
        if (jobId != null && jobId !== "") {
          await monitorRefreshFundingJob(jobId);
        } else {
          addError({ error: "A problem occurred while refreshing funding" });
        }
      } catch (err: any) {
        if (err.response?.status === 400) {
          const errResponse = err.response.data;
          addValidationErrors({ validationErrors: errResponse, message: "Validation failed" });
        } else {
          addError({ description: "A problem occurred while refreshing funding", error: err });
        }
      }
    }
  }

  async function isUserAllowedToChooseSpecification() {
    if (!specification) return false;

    if (!canChooseForFunding) {
      addError({ error: "You do not have permissions to choose this specification for funding" });
      return false;
    }
    if (specification.approvalStatus !== PublishStatus.Approved) {
      addError({
        error: "Specification must be approved before the specification can be chosen for funding.",
      });
      return false;
    }
    if (!calculationSummaries) return false;
    if (
      calculationSummaries
        .filter((calc) => calc.calculationType === CalculationType.Template)
        .some((calc) => calc.status !== PublishStatus.Approved)
    ) {
      addError({
        error: "Template calculations must be approved before the specification can be chosen for funding.",
      });
      return false;
    }

    return true;
  }

  async function submitApproveAllCalculations(confirm: boolean) {
    if (confirm) {
      try {
        const response = await calculationService.approveAllCalculationsService(specificationId);
        if (response.status !== 200 || !response.data?.jobId?.length) {
          addError({ error: "A problem occurred while approving all calculations" });
        } else {
          await monitorApproveAllCalculationsJob(response.data?.jobId);
        }
      } catch (err: any) {
        addError({ description: "A problem occurred while approving all calculations", error: err });
      }
    }
  }

  async function isUserAllowedToApproveAllCalculations() {
    if (!canApproveAllCalculations) {
      addError({ error: "You don't have permission to approve calculations" });
      return false;
    }

    return true;
  }

  async function approveAllCalculations() {
    try {
      clearErrorMessages();
      const isAllowed: boolean = await isUserAllowedToApproveAllCalculations();
      if (isAllowed) {
        ConfirmationModal(
          "Are you sure you want to approve all calculations?",
          submitApproveAllCalculations,
          "Confirm",
          "Cancel"
        );
      } else {
        addError({ error: "You don't have permissions to approve all calculations" });
      }
    } catch (e) {
      addError({ error: "A problem occurred while getting user permissions" });
    }
  }

  const onApproveSpecification = async (event: any) => {
    event.preventDefault();
    try {
      await specificationService.approveSpecification(specificationId);
      await clearSpecificationFromCache();
    } catch (e: any) {
      addError({
        error: e,
        description: "Error whilst approving specification",
      });
    }
  };

  if (!specification) return null;

  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds govuk-!-margin-bottom-5">
        <h1 className="govuk-heading-xl govuk-!-margin-bottom-1">{specification.name}</h1>
        <span className="govuk-caption-l">
          {specification.fundingStreams[0].name} for {specification.fundingPeriod.name}
        </span>
        {specification.isSelectedForFunding && (
          <strong className="govuk-tag govuk-!-margin-bottom-5">Chosen for funding</strong>
        )}
        <p className="govuk-body govuk-!-margin-top-2">
          <strong className="govuk-tag">{specification.approvalStatus}</strong>{" "}
          {fundingConfiguration && fundingConfiguration.enableConverterDataMerge && (
            <strong className="govuk-tag govuk-tag--green">In year opener enabled</strong>
          )}
        </p>
        <div className="govuk-!-padding-top-9">
          <Details title={`What is ${specification.name}`} body={specification.description} />
        </div>
      </div>

      <div className="govuk-grid-column-one-third">
        <ul className="govuk-list">
          <li>Actions:</li>
          {calculationSummaries &&
            calculationSummaries
              .filter((calc) => calc.calculationType === CalculationType.Template)
              .some((calc) => calc.status !== PublishStatus.Approved) && (
              <li>
                <button
                  type="button"
                  className="govuk-link"
                  onClick={approveAllCalculations}
                  data-testid="approve-calculations"
                >
                  Approve all calculations
                </button>
              </li>
            )}
          {specification.approvalStatus !== "Approved" && (
            <li>
              <Link to="#" onClick={onApproveSpecification}>
                Approve specification
              </Link>
            </li>
          )}
          {isLoadingSelectedForFunding && <LoadingFieldStatus title={"checking funding status..."} />}
          {!isLoadingSelectedForFunding &&
            !isLoadingCalculationSummaries &&
            !specification.isSelectedForFunding &&
              !specsSelectedForFunding?.length && (
              <li>
                <button
                  type="button"
                  className="govuk-link"
                  onClick={chooseForFunding}
                  data-testid="choose-for-funding"
                >
                  Choose for funding
                </button>
              </li>
            )}
          <li>
            <Link to={`/Specifications/EditSpecification/${specificationId}`} className="govuk-link">
              Edit specification
            </Link>
          </li>
        </ul>

        <ul className="govuk-list">
          {!isLoadingSpecificationResults &&
            (specificationHasCalculationResults || !!specsSelectedForFunding?.length) && (
              <li>Navigate to:</li>
            )}
          {!isLoadingSpecsSelectedForFunding &&
            !!specsSelectedForFunding?.length &&
            (enableNewFundingManagement ? (
              <>
                <li>
                  <Link
                    className={"govuk-link"}
                    to={`/FundingManagement/Approve/Results/${specification.fundingStreams[0].id}/${specification.fundingPeriod.id}/${specificationId}`}
                  >
                    Funding approvals
                  </Link>
                </li>
                <li>
                  <Link
                    className={"govuk-link"}
                    to={`/FundingManagement/Release/Results/${specification.fundingStreams[0]?.id}/${specification.fundingPeriod.id}/${specificationId}`}
                  >
                    Release management
                  </Link>
                </li>
              </>
            ) : (
              <li>
                <Link
                  className={"govuk-link"}
                  to={`/Approvals/SpecificationFundingApproval/${specification.fundingStreams[0].id}/${specification.fundingPeriod.id}/${specificationId}`}
                >
                  Funding approvals
                </Link>
              </li>
            ))}
          {!isLoadingSpecificationResults && specificationHasCalculationResults && (
            <li>
              <Link className={"govuk-link"} to={`/ViewSpecificationResults/${specificationId}`}>
                View specification results
              </Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};
