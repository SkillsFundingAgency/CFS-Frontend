import { useQuery } from "react-query";
import { AxiosError } from "axios";
import { FundingLineProfileVariationPointer } from "../../types/Specifications/ProfileVariationPointer";
import { getProfileVariationPointersService } from "../../services/specificationService";

export interface ProfileVariationPointersQueryProps {
  specificationId: string | undefined;
  enabled?: boolean | undefined;
  onError: (err: AxiosError) => void;
  onSuccess: () => void;
}

export interface ProfileVariationPointersResult {
  profileVariationPointers: FundingLineProfileVariationPointer[] | undefined;
  isLoadingVariationManagement: boolean;
  isFetchingVariationManagement: boolean;
}

export const useProfileVariationPointers = ({
  specificationId,
  enabled,
  onError,
}: ProfileVariationPointersQueryProps): ProfileVariationPointersResult => {
  const { data, isLoading, isFetching } = useQuery<FundingLineProfileVariationPointer[], AxiosError>(
    `funding-line-profile-variation-pointers-for-spec-${specificationId}`,
    async () => (await getProfileVariationPointersService(specificationId as string)).data,
    {
      enabled: enabled && !!specificationId?.length,
      onError: onError,
    }
  );

  return {
    profileVariationPointers: data,
    isLoadingVariationManagement: isLoading,
    isFetchingVariationManagement: isFetching,
  };
};
