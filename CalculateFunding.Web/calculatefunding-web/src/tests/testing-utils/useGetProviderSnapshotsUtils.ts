import { GetProviderSnapshotsQueryResult } from "../../hooks/useGetProviderSnapshots";
import * as providerSnapshotsHook from "../../hooks/useGetProviderSnapshots";
import { ProviderSnapshot } from "../../types/CoreProviderSummary";

const createGetProviderSnapshotsQueryResult = (
  snapshots: ProviderSnapshot[]
): GetProviderSnapshotsQueryResult => {
  return {
    providerSnapshots: snapshots,
    isLoadingProviderSnapshots: false,
  };
};

const spy: jest.SpyInstance = jest.spyOn(providerSnapshotsHook, "useGetProviderSnapshots");

const hasProviderSnapshots = (snapshots: ProviderSnapshot[]) =>
  spy.mockImplementation(() => createGetProviderSnapshotsQueryResult(snapshots));

const hasNoProviderSnapshots = () => hasProviderSnapshots([]);

export const useGetProviderSnapshotsUtils = {
  spy,
  hasNoProviderSnapshots,
  hasProviderSnapshots,
};
