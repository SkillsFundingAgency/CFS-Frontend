export enum Permission {
  CanAdministerFundingStream = "Can administer funding stream",
  CanCreateSpecification = "Can create specifications",
  CanEditSpecification = "Can edit specifications",
  CanApproveSpecification = "Can approve specifications",
  CanEditCalculations = "Can edit calculations",
  CanMapDatasets = "Can map data sets",
  CanChooseFunding = "Can choose funding",
  CanRefreshFunding = "Can refresh funding",
  CanApproveFunding = "Can approve funding",
  CanReleaseFunding = "Can release funding",
  CanCreateTemplates = "Can create templates",
  CanEditTemplates = "Can edit templates",
  CanApproveTemplates = "Can approve templates",
  CanCreateProfilePattern = "Can create profile pattern",
  CanEditProfilePattern = "Can edit profile pattern",
  CanAssignProfilePattern = "Can assign profile pattern",
  CanApplyCustomProfilePattern = "Can apply custom profile pattern",
  CanApproveCalculations = "Can approve calculations", // only if user is not the last editor
  CanApproveAnyCalculations = "Can approve any calculations", // even if user is the last editor
  CanApproveAllCalculations = "Can approve all calculations", // only as a batch of all calcs
  CanRefreshPublishedQa = "Can push CFS data into SQL for QA",
  CanUploadDataSourceFiles = "Can upload data source files",
}

export const PermissionsCategories: { [key: string]: Permission[] } = {
  "Administration permissions": [Permission.CanAdministerFundingStream],
  "Calculation permissions": [
    Permission.CanApproveAllCalculations,
    Permission.CanApproveAnyCalculations,
    Permission.CanApproveCalculations,
    Permission.CanEditCalculations,
  ],
  "Data permissions": [
    Permission.CanMapDatasets,
    Permission.CanRefreshPublishedQa,
    Permission.CanUploadDataSourceFiles,
  ],
  "Funding permissions": [
    Permission.CanApproveFunding,
    Permission.CanChooseFunding,
    Permission.CanRefreshFunding,
    Permission.CanReleaseFunding,
  ],
  "Profile permissions": [
    Permission.CanApplyCustomProfilePattern,
    Permission.CanAssignProfilePattern,
    Permission.CanCreateProfilePattern,
    Permission.CanEditProfilePattern,
  ],
  "Specification permissions": [
    Permission.CanApproveSpecification,
    Permission.CanCreateSpecification,
    Permission.CanEditSpecification,
  ],
  "Template permissions": [
    Permission.CanApproveTemplates,
    Permission.CanCreateTemplates,
    Permission.CanEditTemplates,
  ],
};
