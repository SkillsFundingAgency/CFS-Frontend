export interface EffectiveSpecificationPermission{
    canCreateQaTests:           boolean;
    canReleaseFunding:          boolean;
    canApproveFunding:          boolean;
    canRefreshFunding:          boolean;
    canChooseFunding:           boolean;
    canMapDatasets:             boolean;
    canDeleteCalculations:      boolean;
    canEditCalculations:        boolean;
    canDeleteSpecification:     boolean;
    canApproveSpecification:    boolean;
    canEditSpecification:       boolean;
    canCreateSpecification:     boolean;
    canAdministerFundingStream: boolean;
    userId:                     string;
    specificationId:            string;
    canEditQaTests:             boolean;
    canDeleteQaTests:           boolean;
}