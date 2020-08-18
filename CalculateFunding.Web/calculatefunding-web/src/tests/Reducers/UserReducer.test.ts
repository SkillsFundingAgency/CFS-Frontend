import {UserActionTypes} from "../../actions/userAction";
import {reduceUserState} from "../../reducers/userReducer";

const payload = [{
    "userId": "",
    "fundingStreamId": "DSG",
    "canAdministerFundingStream": false,
    "canCreateSpecification": false,
    "canEditSpecification": false,
    "canApproveSpecification": false,
    "canDeleteSpecification": false,
    "canEditCalculations": false,
    "canDeleteCalculations": false,
    "canMapDatasets": false,
    "canChooseFunding": false,
    "canRefreshFunding": false,
    "canApproveFunding": false,
    "canReleaseFunding": false,
    "canCreateQaTests": false,
    "canEditQaTests": false,
    "canDeleteQaTests": false,
    "canCreateTemplates": true,
    "canEditTemplates": true,
    "canDeleteTemplates": true,
    "canApproveTemplates": true
}];
const fundingStreamPermissionsDsgState = {
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
    fundingStreamId: "DSG",
    userId: ""
};

describe("user-reducer", () => {
    it("Should return the initial state", () => {
        expect(reduceUserState(undefined, {type: UserActionTypes.GET_FUNDING_STREAM_PERMISSIONS, payload: []}))
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
                type: UserActionTypes.GET_FUNDING_STREAM_PERMISSIONS,
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


