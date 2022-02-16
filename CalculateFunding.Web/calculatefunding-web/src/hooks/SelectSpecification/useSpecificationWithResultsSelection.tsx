import { useState } from "react";

import { ErrorProps } from "../useErrors";
import { useFindSpecificationsWithResults } from "../useFindSpecificationsWithResults";
import { useFundingPeriodsByFundingStreamId } from "../useFundingPeriodsByFundingStreamId";
import { useFundingStreams } from "../useFundingStreams";

export const useSpecificationWithResultsSelection = (
  addError: (props: ErrorProps) => void,
  clearErrorMessages: (fieldNames?: string[]) => void
) => {
  const [selectedFundingStreamId, setSelectedFundingStreamId] = useState<string | undefined>();
  const [selectedFundingPeriodId, setSelectedFundingPeriodId] = useState<string | undefined>();
  const [selectedSpecificationId, setSelectedSpecificationId] = useState<string | undefined>();

  const { fundingStreams, isLoadingFundingStreams } = useFundingStreams(false, {
    onSuccess: () => {
      setSelectedFundingStreamId(undefined);
      setSelectedFundingPeriodId(undefined);
      setSelectedSpecificationId(undefined);
      clearErrorMessages();
    },
    onError: (err: any) =>
      addError({
        error: err,
        description: "Error while loading funding streams",
        fieldName: "funding-streams",
      }),
  });

  const { fundingPeriods, isLoadingFundingPeriods } = useFundingPeriodsByFundingStreamId(
    selectedFundingStreamId,
    {
      onSuccess: () => {
        setSelectedFundingPeriodId(undefined);
        setSelectedSpecificationId(undefined);
        clearErrorMessages();
      },
      onError: (err: any) =>
        addError({
          error: err,
          description: "Error while loading funding periods",
          fieldName: "funding-periods",
        }),
    }
  );

  const {
    specificationsWithResults,
    isLoadingSpecificationsWithResults,
    hasFetchedSpecificationsWithResults,
  } = useFindSpecificationsWithResults(selectedFundingStreamId, selectedFundingPeriodId, {
    onSuccess: () => {
      setSelectedSpecificationId(undefined);
      clearErrorMessages();
    },
    onError: (err: any) =>
      addError({
        error: err,
        description: "Error while loading matching specifications",
        fieldName: "specifications",
      }),
  });

  return {
    fundingStreams,
    isLoadingFundingStreams,
    selectedFundingStreamId,
    setSelectedFundingStreamId,
    fundingPeriods,
    isLoadingFundingPeriods,
    selectedFundingPeriodId,
    setSelectedFundingPeriodId,
    specificationsWithResults,
    isLoadingSpecificationsWithResults,
    hasFetchedSpecificationsWithResults,
    selectedSpecificationId,
    setSelectedSpecificationId,
  };
};
