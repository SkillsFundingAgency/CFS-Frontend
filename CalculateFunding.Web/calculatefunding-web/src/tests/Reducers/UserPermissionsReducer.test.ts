import {UserPermissionsActionTypes} from "../../actions/UserPermissionsActions";
import {reduceUserPermissionsState} from "../../reducers/userPermissionsReducer";

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

describe("user-permissions-reducer", () => {
    it("Should return the initial state", () => {
        expect(reduceUserPermissionsState(undefined, {type: UserPermissionsActionTypes.GET_FUNDING_STREAM_PERMISSIONS, payload: []}))
            .toEqual({"fundingStreamPermissions": []});
    });

    it("Should handle updated state", () => {
        expect(reduceUserPermissionsState({fundingStreamPermissions: [fundingStreamPermissionsDsgState]}, {
            type: UserPermissionsActionTypes.GET_FUNDING_STREAM_PERMISSIONS,
            payload: payload
        })).toEqual({fundingStreamPermissions: [fundingStreamPermissionsDsgState]})
    })
});


