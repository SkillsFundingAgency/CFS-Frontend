import {UserActionEvent} from "../../actions/userAction";
import {reduceUserState} from "../../reducers/userReducer";
import {FundingStreamPermissions} from "../../types/FundingStreamPermissions";

const payload: [FundingStreamPermissions] = [{
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
    canCreateTemplates: true,
    canEditTemplates: true,
    canDeleteTemplates: true,
    canApproveTemplates: true,
    canEditProfilePattern: false,
    canDeleteProfilePattern: false,
    canCreateProfilePattern: false,
    canAssignProfilePattern: false,
    canApplyCustomProfilePattern: false,
    fundingStreamId: "DSG",
    userId: ""
}];
export const fundingStreamPermissionsDsgState: FundingStreamPermissions = {
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
    canCreateTemplates: true,
    canEditTemplates: true,
    canDeleteTemplates: true,
    canApproveTemplates: true,
    canEditProfilePattern: false,
    canDeleteProfilePattern: false,
    canCreateProfilePattern: false,
    canAssignProfilePattern: false,
    canApplyCustomProfilePattern: false,
    fundingStreamId: "DSG",
    userId: ""
};

describe("user-reducer", () => {
    it("Should return the initial state", () => {
        expect(reduceUserState(undefined, {type: UserActionEvent.GET_FUNDING_STREAM_PERMISSIONS, payload: []}))
            .toEqual({
                "fundingStreamPermissions": [],
                "hasConfirmedSkills": undefined,
                "isLoggedIn": false,
                "userName": ""
            });
    });

    it("Should handle updated state", () => {
        expect(reduceUserState(
            {
                fundingStreamPermissions: [fundingStreamPermissionsDsgState],
                hasConfirmedSkills: true,
                isLoggedIn: true,
                userName: "test-user"
            },
            {
                type: UserActionEvent.GET_FUNDING_STREAM_PERMISSIONS,
                payload: payload
            }))
            .toEqual({
                "fundingStreamPermissions": [fundingStreamPermissionsDsgState],
                "hasConfirmedSkills": true,
                "isLoggedIn": true,
                "userName": "test-user"
            });
    })
});


