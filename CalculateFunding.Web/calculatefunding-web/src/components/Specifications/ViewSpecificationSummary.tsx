import { useMemo } from "react";
import * as React from "react";
import { Link } from "react-router-dom";

import { useErrorContext } from "../../context/ErrorContext";
import { useSpecificationPermissions } from "../../hooks/Permissions/useSpecificationPermissions";
import { useSpecificationResults } from "../../hooks/Specifications/useSpecificationResults";
import { useFundingConfiguration } from "../../hooks/useFundingConfiguration";
import * as calculationService from "../../services/calculationService";
import * as publishService from "../../services/publishService";
import { CalculationSummary } from "../../types/CalculationDetails";
import { CalculationType } from "../../types/CalculationSearchResponse";
import { Permission } from "../../types/Permission";
import { PublishStatus } from "../../types/PublishStatusModel";
import { SpecificationSummary } from "../../types/SpecificationSummary";
import { ConfirmationModal } from "../ConfirmationModal";
import { Details } from "../Details";
import { LoadingFieldStatus } from "../LoadingFieldStatus";

export const ViewSpecificationSummary = ({
  specification,
  isLoadingSelectedForFunding,
  monitorRefreshFundingJob,
  monitorApproveAllCalculationsJob,
  selectedForFundingSpecId,
}: {
  specification: SpecificationSummary;
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

  const { hasPermission, isPermissionsFetched } = useSpecificationPermissions(specification.id, [
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
    specification.fundingStreams[0]?.id,
    specification.fundingPeriod?.id,
    (err) => addError({ error: err, description: "Error while loading funding configuration" })
  );

  const { specificationHasCalculationResults, isLoadingSpecificationResults } = useSpecificationResults(
    specification.id,
    specification.fundingStreams[0].id,
    specification.fundingPeriod.id,
    (err) => addError({ error: err, description: "Error while loading specification results" })
  );

  async function chooseForFunding() {
    try {
      clearErrorMessages();
      const isAllowed: boolean = await isUserAllowedToChooseSpecification(specification.id);
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
        const response = await publishService.refreshSpecificationFundingService(specification.id);
        const jobId = response.data as string;
        if (jobId != null && jobId !== "") {
          await monitorRefreshFundingJob(jobId);
        } else {
          addError({ error: "A problem occurred while refreshing funding" });
        }
      } catch (err: any) {
        if (err.response.status === 400) {
          const errResponse = err.response.data;
          addValidationErrors({ validationErrors: errResponse, message: "Validation failed" });
        } else {
          addError({ description: "A problem occurred while refreshing funding", error: err });
        }
      }
    }
  }

  async function isUserAllowedToChooseSpecification(specificationId: string) {
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
    try {
      const calcs: CalculationSummary[] = (
        await calculationService.getCalculationSummaryBySpecificationId(specificationId)
      ).data;
      if (
        calcs
          .filter((calc) => calc.calculationType === CalculationType.Template)
          .some((calc) => calc.status !== PublishStatus.Approved)
      ) {
        addError({
          error: "Template calculations must be approved before the specification can be chosen for funding.",
        });
        return false;
      }
    } catch (err) {
      addError({ error: "A problem occurred while choosing specification" });
      return false;
    }
    return true;
  }

  async function submitApproveAllCalculations(confirm: boolean) {
    if (confirm) {
      try {
        const response = await calculationService.approveAllCalculationsService(specification.id);
        if (response.status !== 200 || !response.data?.id) {
          addError({ error: "A problem occurred while approving all calculations" });
        } else {
          await monitorApproveAllCalculationsJob(response.data?.id);
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
    try {
      const calcs: CalculationSummary[] = (
        await calculationService.getCalculationSummaryBySpecificationId(specification.id)
      ).data;
      if (!calcs.some((calc) => calc.status !== PublishStatus.Approved)) {
        addError({ error: "All calculations have already been approved" });
        return false;
      }
    } catch (err) {
      addError({ error: "Approve all calculations failed - try again" });
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
      }
    } catch (e) {
      addError({ error: "A problem occurred while getting user permissions" });
    }
  }

  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds govuk-!-margin-bottom-5">
        <h1 className="govuk-heading-xl govuk-!-margin-bottom-1">{specification.name}</h1>
        <span className="govuk-caption-l">
          {specification.fundingStreams[0]?.name} for {specification?.fundingPeriod?.name}
        </span>
        {!isLoadingSelectedForFunding && specification.isSelectedForFunding && (
          <strong className="govuk-tag govuk-!-margin-bottom-5">Chosen for funding</strong>
        )}
        {fundingConfiguration && fundingConfiguration.enableConverterDataMerge && (
          <p className="govuk-body govuk-!-margin-top-2">
            <strong className="govuk-tag govuk-tag--green">In year opener enabled</strong>
          </p>
        )}
      </div>
      <div className="govuk-grid-column-two-thirds">
        <Details title={`What is ${specification.name}`} body={specification.description} />
      </div>
      <div className="govuk-grid-column-one-third">
        <ul className="govuk-list">
          <li>
            <Link to={`/Specifications/EditSpecification/${specification.id}`} className="govuk-link">
              Edit specification
            </Link>
          </li>

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
          {isLoadingSelectedForFunding && <LoadingFieldStatus title={"checking funding status..."} />}
          {!isLoadingSelectedForFunding && (
            <li>
              {specification.isSelectedForFunding || selectedForFundingSpecId ? (
                <Link
                  className="govuk-link govuk-link--no-visited-state"
                  to={`/Approvals/SpecificationFundingApproval/${specification.fundingStreams[0]?.id}/${specification.fundingPeriod.id}/${selectedForFundingSpecId}`}
                >
                  View funding
                </Link>
              ) : (
                <button
                  type="button"
                  className="govuk-link"
                  onClick={chooseForFunding}
                  data-testid="choose-for-funding"
                >
                  Choose for funding
                </button>
              )}
            </li>
          )}
          {!isLoadingSpecificationResults && specificationHasCalculationResults && (
            <li>
              <Link className={"govuk-link"} to={`/ViewSpecificationResults/${specification.id}`}>
                View specification results
              </Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};
