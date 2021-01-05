export interface UserPermissions {
    canCreateQaTests: boolean;
    canReleaseFunding: boolean;
    canApproveFunding: boolean;
    canRefreshFunding: boolean;
    canChooseFunding: boolean;
    canMapDatasets: boolean;
    canDeleteCalculations: boolean;
    canEditCalculations: boolean;
    canApproveCalculations: boolean;
    canApplyCustomProfilePattern: boolean;
    canAssignProfilePattern: boolean;
    canApproveAnyCalculations: boolean;
    canApproveAllCalculations: boolean;
    canDeleteSpecification: boolean;
    canApproveSpecification: boolean;
    canEditSpecification: boolean;
    canCreateSpecification: boolean;
    canAdministerFundingStream: boolean;
    userId: string;
    canEditQaTests: boolean;
    canDeleteQaTests: boolean;
    canCreateTemplates: boolean;
    canEditTemplates: boolean;
    canDeleteTemplates: boolean;
    canApproveTemplates: boolean;
}
