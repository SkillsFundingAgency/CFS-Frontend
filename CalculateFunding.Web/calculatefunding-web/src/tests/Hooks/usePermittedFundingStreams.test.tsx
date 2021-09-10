import { renderHook } from "@testing-library/react-hooks";
import * as redux from "react-redux";

import { usePermittedFundingStreams } from "../../hooks/Permissions/usePermittedFundingStreams";
import { FundingStreamPermissions } from "../../types/FundingStreamPermissions";
import { UserPermission } from "../../types/UserPermission";
import { buildPermissions } from "../fakes/testFactories";

const useSelectorSpy = jest.spyOn(redux, "useSelector");

const noPermissionsFundingStream: FundingStreamPermissions = buildPermissions({
  fundingStreamId: "DSG",
  setAllPermsEnabled: false,
});
const withChooseForFundingPermissionsFundingStream: FundingStreamPermissions = buildPermissions({
  fundingStreamId: "GAG",
  actions: [(p) => (p.canChooseFunding = true)],
});

describe("usePermittedFundingStreams tests", () => {
  describe("when user has some funding stream permission", () => {
    beforeEach(() => {
      useSelectorSpy.mockClear();
      useSelectorSpy.mockReturnValue([
        withChooseForFundingPermissionsFundingStream,
        noPermissionsFundingStream,
      ]);
    });

    it("handles when there are no funding streams that user has permission for", () => {
      const { result } = renderHook(() =>
        usePermittedFundingStreams(UserPermission.CanUploadDataSourceFiles)
      );
      expect(result.current).toHaveLength(0);
    });

    it("includes funding stream that user has permission for", () => {
      const { result } = renderHook(() => usePermittedFundingStreams(UserPermission.CanChooseFunding));
      expect(result.current).toContain(withChooseForFundingPermissionsFundingStream.fundingStreamId);
    });

    it("filters out funding streams correctly", () => {
      const { result } = renderHook(() => usePermittedFundingStreams(UserPermission.CanChooseFunding));
      expect(result.current).not.toContain(noPermissionsFundingStream.fundingStreamId);
    });
  });
  describe("when user has no funding stream permission results", () => {
    beforeEach(() => {
      useSelectorSpy.mockClear();
      useSelectorSpy.mockReturnValue([]);
    });

    it("handles when there are no funding streams that user has permission for", () => {
      const { result } = renderHook(() =>
        usePermittedFundingStreams(UserPermission.CanUploadDataSourceFiles)
      );
      expect(result.current).toHaveLength(0);
    });
  });
});
