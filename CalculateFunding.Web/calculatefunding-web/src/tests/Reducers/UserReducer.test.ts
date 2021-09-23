import { UserActionEvent } from "../../actions/userAction";
import { reduceUserState } from "../../reducers/userReducer";
import { FundingStreamPermissions } from "../../types/FundingStreamPermissions";

const payload: [FundingStreamPermissions] = [
  {
    canReleaseFunding: false,
    canApproveFunding: false,
    canRefreshFunding: false,
    canChooseFunding: false,
    canMapDatasets: false,
    canEditCalculations: false,
    canApproveCalculations: false,
    canApplyCustomProfilePattern: false,
    canAssignProfilePattern: false,
    canApproveAnyCalculations: false,
    canApproveAllCalculations: false,
    canApproveSpecification: false,
    canEditSpecification: false,
    canCreateSpecification: false,
    canAdministerFundingStream: false,
    canCreateTemplates: false,
    canEditTemplates: true,
    canApproveTemplates: true,
    canEditProfilePattern: false,
    canRefreshPublishedQa: false,
    canUploadDataSourceFiles: false,
    canCreateProfilePattern: false,
    fundingStreamId: "DSG",
    userId: "",
  },
];
export const fundingStreamPermissionsDsgState: FundingStreamPermissions = {
  canReleaseFunding: false,
  canApproveFunding: false,
  canRefreshFunding: false,
  canChooseFunding: false,
  canMapDatasets: false,
  canEditCalculations: false,
  canApproveCalculations: false,
  canApplyCustomProfilePattern: false,
  canAssignProfilePattern: false,
  canApproveAnyCalculations: false,
  canApproveAllCalculations: false,
  canApproveSpecification: false,
  canEditSpecification: false,
  canCreateSpecification: false,
  canAdministerFundingStream: false,
  canCreateTemplates: false,
  canEditTemplates: true,
  canApproveTemplates: true,
  canEditProfilePattern: false,
  canRefreshPublishedQa: false,
  canUploadDataSourceFiles: false,
  canCreateProfilePattern: false,
  fundingStreamId: "DSG",
  userId: "",
};

describe("user-reducer", () => {
  describe("GET_FUNDING_STREAM_PERMISSIONS", () => {
    it("Should return the initial state", () => {
      expect(
        reduceUserState(undefined, { type: UserActionEvent.GET_FUNDING_STREAM_PERMISSIONS, payload: [] })
      ).toEqual({
        fundingStreamPermissions: [],
        hasConfirmedSkills: undefined,
        isLoggedIn: false,
        userName: "",
      });
    });

    it("Should handle updated state", () => {
      expect(
        reduceUserState(
          {
            fundingStreamPermissions: [fundingStreamPermissionsDsgState],
            hasConfirmedSkills: true,
            isLoggedIn: true,
            userName: "test-user",
          },
          {
            type: UserActionEvent.GET_FUNDING_STREAM_PERMISSIONS,
            payload: payload,
          }
        )
      ).toEqual({
        fundingStreamPermissions: [fundingStreamPermissionsDsgState],
        hasConfirmedSkills: true,
        isLoggedIn: true,
        userName: "test-user",
      });
    });
  });

  describe("GET_USER", () => {
    it("Should return the initial state", () => {
      expect(reduceUserState(undefined, { type: UserActionEvent.GET_USER, payload: "" })).toEqual({
        fundingStreamPermissions: [],
        hasConfirmedSkills: undefined,
        isLoggedIn: false,
        userName: "",
      });
    });

    it("Should handle updated state", () => {
      expect(
        reduceUserState(
          {
            fundingStreamPermissions: [fundingStreamPermissionsDsgState],
            hasConfirmedSkills: true,
            isLoggedIn: true,
            userName: "test-user",
          },
          {
            type: UserActionEvent.GET_USER,
            payload: "test",
          }
        )
      ).toEqual({
        fundingStreamPermissions: [fundingStreamPermissionsDsgState],
        hasConfirmedSkills: true,
        isLoggedIn: true,
        userName: "test",
      });
    });
  });
});
