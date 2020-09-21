import { useTemplatePermissions } from "../../hooks/useTemplatePermissions";
import * as redux from "react-redux";
import { FundingStreamPermissions } from "../../types/FundingStreamPermissions";
import { renderHook } from '@testing-library/react-hooks';

const useSelectorSpy = jest.spyOn(redux, 'useSelector');

export const permissionsState: FundingStreamPermissions[] = [{
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
    canDeleteTemplates: true,
    canApproveTemplates: true,
    canApplyCustomProfilePattern: false,
    canAssignProfilePattern: false,
    canDeleteProfilePattern: false,
    canEditProfilePattern: false,
    canCreateProfilePattern: false
},
{
    fundingStreamId: "GAG",
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
    canDeleteProfilePattern: false,
    canEditProfilePattern: false,
    canCreateProfilePattern: false
},
{
    fundingStreamId: "1619",
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
    canEditTemplates: true,
    canDeleteTemplates: false,
    canApproveTemplates: false,
    canApplyCustomProfilePattern: false,
    canAssignProfilePattern: false,
    canDeleteProfilePattern: false,
    canEditProfilePattern: false,
    canCreateProfilePattern: false
}];

beforeEach(() => {
    useSelectorSpy.mockClear();
    useSelectorSpy.mockReturnValue(permissionsState);
});

it("handles empty parameters correctly", () => {
    const { result } = renderHook(() => useTemplatePermissions([]));
    expect(result.current.missingPermissions).toEqual([]);
    expect(result.current.canEditTemplate).toBeTruthy();
    expect(result.current.canCreateTemplate).toBeFalsy();
    expect(result.current.canDeleteTemplate).toBeTruthy();
    expect(result.current.canApproveTemplate).toBeTruthy();
});

it("handles all parameters used correctly", () => {
    const { result } = renderHook(() => useTemplatePermissions(["edit", "create", "delete", "approve"], ["DSG", "GAG", "1619"]));
    expect(result.current.missingPermissions).toEqual(["create"]);
    expect(result.current.canEditTemplate).toBeTruthy();
    expect(result.current.canCreateTemplate).toBeFalsy();
    expect(result.current.canDeleteTemplate).toBeTruthy();
    expect(result.current.canApproveTemplate).toBeTruthy();
});

it("calculates missing create permissions correctly", () => {
    const { result } = renderHook(() => useTemplatePermissions(["create"]));
    expect(result.current.missingPermissions).toEqual(["create"]);
});

it("calculates permissions correctly for a funding stream", () => {
    const { result } = renderHook(() => useTemplatePermissions(["delete", "approve"], ["DSG"]));
    expect(result.current.missingPermissions).toEqual([]);
    expect(result.current.canEditTemplate).toBeFalsy();
    expect(result.current.canCreateTemplate).toBeFalsy();
    expect(result.current.canDeleteTemplate).toBeTruthy();
    expect(result.current.canApproveTemplate).toBeTruthy();
});

it("calculates permissions correctly for multiple funding streams", () => {
    const { result } = renderHook(() => useTemplatePermissions(["create", "edit","delete", "approve"], ["DSG", "1619"]));
    expect(result.current.missingPermissions).toEqual(["create"]);
    expect(result.current.canEditTemplate).toBeTruthy();
    expect(result.current.canCreateTemplate).toBeFalsy();
    expect(result.current.canDeleteTemplate).toBeTruthy();
    expect(result.current.canApproveTemplate).toBeTruthy();
});

it("calculates required funding streams correctly when user has permission", () => {
    const { result } = renderHook(() => useTemplatePermissions(["create", "edit","delete", "approve"], ["1619"]));
    expect(result.current.missingPermissions).toEqual(["create", "delete", "approve"]);
    expect(result.current.canEditTemplate).toBeTruthy();
    expect(result.current.canCreateTemplate).toBeFalsy();
    expect(result.current.canDeleteTemplate).toBeFalsy();
    expect(result.current.canApproveTemplate).toBeFalsy();
});

it("calculates required funding streams correctly when user does not have permission", () => {
    const { result } = renderHook(() => useTemplatePermissions(["edit"], ["DSG"]));
    expect(result.current.missingPermissions).toEqual(["edit"]);
    expect(result.current.canEditTemplate).toBeFalsy();
});

it("calculates correctly when user has no permissions for a funding stream", () => {
    const { result } = renderHook(() => useTemplatePermissions(["create", "edit", "delete", "approve"], ["GAG"]));
    expect(result.current.missingPermissions).toEqual(["edit", "create", "delete", "approve"]);
    expect(result.current.canEditTemplate).toBeFalsy();
    expect(result.current.canCreateTemplate).toBeFalsy();
    expect(result.current.canDeleteTemplate).toBeFalsy();
    expect(result.current.canApproveTemplate).toBeFalsy();
});

it("calculates correctly when user has permissions across multiple funding streams", () => {
    const { result } = renderHook(() => useTemplatePermissions(["create", "edit", "delete", "approve"], ["GAG", "1619"]));
    expect(result.current.missingPermissions).toEqual(["create", "delete", "approve"]);
    expect(result.current.canEditTemplate).toBeTruthy();
    expect(result.current.canCreateTemplate).toBeFalsy();
    expect(result.current.canDeleteTemplate).toBeFalsy();
    expect(result.current.canApproveTemplate).toBeFalsy();
});

it("calculates funding stream permissions correctly", () => {
    const { result } = renderHook(() => useTemplatePermissions(["create", "edit", "delete", "approve"]));
    expect(result.current.fundingStreamPermissions).toEqual([
        {
            "fundingStreamId": "DSG",
            "permission": "approve"
        },
        {
            "fundingStreamId": "DSG",
            "permission": "delete"
        },
        {
            "fundingStreamId": "1619",
            "permission": "edit"
        },
    ]);
});

it("calculates funding stream permissions correctly (regardless of required permissions)", () => {
    const { result } = renderHook(() => useTemplatePermissions(["create", "edit", "delete"]));
    expect(result.current.fundingStreamPermissions).toEqual([
        {
            "fundingStreamId": "DSG",
            "permission": "approve"
        },
        {
            "fundingStreamId": "DSG",
            "permission": "delete"
        },
        {
            "fundingStreamId": "1619",
            "permission": "edit"
        },
    ]);
});