import * as redux from "react-redux";
import {FundingStreamPermissions} from "../../types/FundingStreamPermissions";
import {renderHook} from "@testing-library/react-hooks";
import {usePermittedFundingStreams} from "../../hooks/useFundingStreamPermissions";
import {UserPermission} from "../../types/UserPermission";

const useSelectorSpy = jest.spyOn(redux, 'useSelector');

const noPermissionsFundingStream: FundingStreamPermissions = {
    fundingStreamId: "DSG",
    userId: "",
    canAdministerFundingStream: false,
    canApproveFunding: false,
    canApproveSpecification: false,
    canChooseFunding: false,
    canCreateQaTests: false,
    canCreateSpecification: false,
    canDeleteCalculations: false,
    canDeleteQaTests: false,
    canDeleteSpecification: false,
    canEditCalculations: false,
    canEditQaTests: false,
    canEditSpecification: false,
    canMapDatasets: false,
    canRefreshFunding: false,
    canReleaseFunding: false,
    canCreateTemplates: false,
    canEditTemplates: false,
    canDeleteTemplates: false,
    canApproveTemplates: false,
    canApplyCustomProfilePattern: false,
    canAssignProfilePattern: false,
    canApproveAllCalculations: false,
    canApproveCalculations: false,
    canApproveAnyCalculations: false,
    canEditProfilePattern: false,
    canRefreshPublishedQa: false,
    canUploadDataSourceFiles: false
}
const withChooseForFundingPermissionsFundingStream: FundingStreamPermissions = {
    fundingStreamId: "GAG",
    userId: "",
    canChooseFunding: true,
    canAdministerFundingStream: false,
    canApproveFunding: false,
    canApproveSpecification: false,
    canCreateQaTests: false,
    canCreateSpecification: false,
    canDeleteCalculations: false,
    canDeleteQaTests: false,
    canDeleteSpecification: false,
    canEditCalculations: false,
    canEditQaTests: false,
    canEditSpecification: false,
    canMapDatasets: false,
    canRefreshFunding: false,
    canReleaseFunding: false,
    canCreateTemplates: false,
    canEditTemplates: false,
    canDeleteTemplates: false,
    canApproveTemplates: false,
    canApplyCustomProfilePattern: false,
    canAssignProfilePattern: false,
    canApproveAllCalculations: false,
    canApproveCalculations: false,
    canApproveAnyCalculations: false,
    canEditProfilePattern: false,
    canRefreshPublishedQa: false,
    canUploadDataSourceFiles: false
}

describe("usePermittedFundingStreams tests", () => {
    describe("when user has some funding stream permission", () => {
        beforeEach(() => {
            useSelectorSpy.mockClear();
            useSelectorSpy.mockReturnValue([withChooseForFundingPermissionsFundingStream, noPermissionsFundingStream]);
        });

        it("handles when there are no funding streams that user has permission for", () => {
            const {result} = renderHook(() => usePermittedFundingStreams(UserPermission.CanUploadDataSourceFiles));
            expect(result.current).toHaveLength(0);
        });

        it("includes funding stream that user has permission for", () => {
            const {result} = renderHook(() => usePermittedFundingStreams(UserPermission.CanChooseFunding));
            expect(result.current).toContain(withChooseForFundingPermissionsFundingStream.fundingStreamId);
        });

        it("filters out funding streams correctly", () => {
            const {result} = renderHook(() => usePermittedFundingStreams(UserPermission.CanChooseFunding));
            expect(result.current).not.toContain(noPermissionsFundingStream.fundingStreamId);
        });
    });
    describe("when user has no funding stream permission results", () => {
        beforeEach(() => {
            useSelectorSpy.mockClear();
            useSelectorSpy.mockReturnValue([]);
        });

        it("handles when there are no funding streams that user has permission for", () => {
            const {result} = renderHook(() => usePermittedFundingStreams(UserPermission.CanUploadDataSourceFiles));
            expect(result.current).toHaveLength(0);
        });
    });
});
