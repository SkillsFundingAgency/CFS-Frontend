import React from "react";

import { FundingActionType } from "../../types/PublishedProvider/PublishedProviderFundingCount";
import { Breadcrumb } from "../Breadcrumbs";

export const FundingResultsBreadcrumb = ({
  actionType,
  specificationId,
  specificationName,
  fundingStreamId,
  fundingPeriodId,
}: {
  actionType: FundingActionType | undefined;
  specificationId: string | undefined;
  specificationName: string | undefined;
  fundingStreamId: string | undefined;
  fundingPeriodId: string | undefined;
}) => (
  <Breadcrumb
    name={specificationName ?? "Specification"}
    url={
      actionType === FundingActionType.Release
        ? `/FundingManagement/Release/Results/${fundingStreamId}/${fundingPeriodId}/${specificationId}`
        : actionType === FundingActionType.Approve
        ? `/FundingManagement/Approve/Results/${fundingStreamId}/${fundingPeriodId}/${specificationId}`
        : ""
    }
  />
);

