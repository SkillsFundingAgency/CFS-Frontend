export interface UserPermissions {
  userId: string;
  canReleaseFunding: boolean;
  canApproveFunding: boolean;
  canRefreshFunding: boolean;
  canChooseFunding: boolean;
  canMapDatasets: boolean;
  canEditCalculations: boolean;
  canApproveCalculations: boolean;
  canApplyCustomProfilePattern: boolean;
  canAssignProfilePattern: boolean;
  canCreateProfilePattern: boolean;
  canEditProfilePattern: boolean;
  canApproveSpecification: boolean;
  canEditSpecification: boolean;
  canCreateSpecification: boolean;
  canAdministerFundingStream: boolean;
  canCreateTemplates: boolean;
  canEditTemplates: boolean;
  canApproveTemplates: boolean;
  canApproveAnyCalculations: boolean;
  canApproveAllCalculations: boolean;
  canRefreshPublishedQa: boolean;
  canUploadDataSourceFiles: boolean;
}
