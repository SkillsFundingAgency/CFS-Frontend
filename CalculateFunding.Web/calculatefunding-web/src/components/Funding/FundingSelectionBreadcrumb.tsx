import React from "react";

import { FundingActionType } from "../../types/PublishedProvider/PublishedProviderFundingCount";
import { Breadcrumb } from "../Breadcrumbs";

export const FundingSelectionBreadcrumb = ({ actionType }: { actionType: FundingActionType | undefined }) => (
  <Breadcrumb
    name={actionType === FundingActionType.Release ? "Release management" : "Funding approvals"}
    url={
      actionType === FundingActionType.Release
        ? "/FundingManagement/Release/Select"
        : "/FundingManagement/Approve/Selection"
    }
  />
);
