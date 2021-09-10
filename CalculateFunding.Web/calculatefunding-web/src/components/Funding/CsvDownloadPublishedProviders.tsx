import React, { useState } from "react";
import { useSelector } from "react-redux";

import { useEffectOnce } from "../../hooks/useEffectOnce";
import { ErrorProps } from "../../hooks/useErrors";
import { IStoreState } from "../../reducers/rootReducer";
import * as publishService from "../../services/publishService";
import { FundingSearchSelectionState } from "../../states/FundingSearchSelectionState";
import { FundingActionType } from "../../types/PublishedProvider/PublishedProviderFundingCount";
import { LoadingFieldStatus } from "../LoadingFieldStatus";

export function CsvDownloadPublishedProviders(props: {
  actionType: FundingActionType;
  specificationId: string;
  addError: (props: ErrorProps) => void;
}) {
  const state: FundingSearchSelectionState = useSelector<IStoreState, FundingSearchSelectionState>(
    (state) => state.fundingSearchSelection
  );
  const [url, setUrl] = useState<string>("");

  const generateCsv = async () => {
    const isBatch = state.selectedProviderIds && state.selectedProviderIds.length > 0;
    try {
      if (props.actionType === FundingActionType.Approve) {
        const response = isBatch
          ? await publishService.generateCsvForApprovalBatch(props.specificationId, state.selectedProviderIds)
          : await publishService.generateCsvForApprovalAll(props.specificationId);
        setUrl(response.data.url);
      }

      if (props.actionType === FundingActionType.Release) {
        const response = isBatch
          ? await publishService.generateCsvForReleaseBatch(props.specificationId, state.selectedProviderIds)
          : await publishService.generateCsvForReleaseAll(props.specificationId);
        setUrl(response.data.url);
      }
    } catch (err: any) {
      props.addError({ error: err, description: "Error while generating CSV" });
    }
  };
  useEffectOnce(() => {
    generateCsv().catch((err) => props.addError({ error: err, description: "Error while generating CSV" }));
  });

  return url === "" ? (
    <LoadingFieldStatus title={"Generating export of providers"} />
  ) : (
    <a href={url}>Export all as CSV</a>
  );
}
