import {BooleanLiteral} from "@babel/types";

export interface FundingStreamPermissions {
    userId:                         string;
    fundingStreamId:                string;
    canCreateQaTests:               boolean;
    canReleaseFunding:              boolean;
    canApproveFunding:              boolean;
    canRefreshFunding:              boolean;
    canChooseFunding:               boolean;
    canMapDatasets:                 boolean;
    canDeleteCalculations:          boolean;
    canEditCalculations:            boolean;
    canDeleteSpecification:         boolean;
    canApproveSpecification:        boolean;
    canEditSpecification:           boolean;
    canCreateSpecification:         boolean;
    canAdministerFundingStream:     boolean;
    canEditQaTests:                 boolean;
    canDeleteQaTests:               boolean;
    canCreateTemplates:             boolean;
    canEditTemplates:               boolean;
    canDeleteTemplates:             boolean;
    canApproveTemplates:            boolean;
    canApplyCustomProfilePattern:   boolean;
    canAssignProfilePattern:        boolean;
    canDeleteProfilePattern:        boolean;
    canEditProfilePattern:          boolean;
    canCreateProfilePattern:        boolean;
}