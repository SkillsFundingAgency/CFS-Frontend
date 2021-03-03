import {Permission} from "../types/Permission";

export function getPermissionDescription(permission: Permission) {
    switch (permission) {
        case Permission.CanAdministerFundingStream:
            return "Can grant and remove permissions for users of a funding stream";
        case Permission.CanCreateSpecification:
            return "Can create a specification for the funding stream";
        case Permission.CanEditSpecification:
            return "Can edit a specification for the funding stream";
        case Permission.CanApproveSpecification:
            return "Can approve a specification for the funding stream";
        case Permission.CanDeleteSpecification:
            return "Can delete a specification for the funding stream";
        case Permission.CanEditCalculations:
            return "Can edit calculations within a specification for the funding stream";
        case Permission.CanDeleteCalculations:
            return "Can delete calculations within a specification for the funding stream";
        case Permission.CanMapDatasets:
            return "Can map data source files to datasets within a specification for the funding stream";
        case Permission.CanChooseFunding:
            return "Can choose an approved specification for the funding stream so that funding allocation values are generated and can be approved and released";
        case Permission.CanRefreshFunding:
            return "Can refresh the funding allocation values for a specification for the funding stream that has been chosen for funding";
        case Permission.CanApproveFunding:
            return "Can approve a funding allocation values for a specification for the funding stream that has been chosen for funding";
        case Permission.CanReleaseFunding:
            return "Can release funding allocation values to downstream services for a specification for the funding stream that has been chosen for funding";
        case Permission.CanCreateQaTests:
            return "Can create tests in the QA environment";
        case Permission.CanEditQaTests:
            return "Can edit tests in the QA environment";
        case Permission.CanDeleteQaTests:
            return "Can delete tests in the QA environment";
        case Permission.CanCreateTemplates:
            return "Can create templates for the funding stream";
        case Permission.CanEditTemplates:
            return "Can edit templates for the funding stream";
        case Permission.CanDeleteTemplates:
            return "Can delete templates for the funding stream";
        case Permission.CanApproveTemplates:
            return "Can approve templates for the funding stream";
        case Permission.CanCreateProfilePattern:
            return "Can create profile patterns for funding lines within the funding stream";
        case Permission.CanEditProfilePattern:
            return "Can edit profile patterns for funding lines within the funding stream";
        case Permission.CanDeleteProfilePattern:
            return "Can delete profile patterns for funding lines within the funding stream";
        case Permission.CanAssignProfilePattern:
            return "Can assign profile patterns for funding lines within the funding stream";
        case Permission.CanApplyCustomProfilePattern:
            return "Can apply custom profile patterns for funding lines within the funding stream";
        case Permission.CanApproveCalculations:
            return "Can approve calculations last edited by another user";
        case Permission.CanApproveAnyCalculations:
            return "Can approve any calculations";
        case Permission.CanApproveAllCalculations:
            return "Can approve all calculations";
        case Permission.CanRefreshPublishedQa:
            return "Can push CFS data into SQL for QA";
        case Permission.CanUploadDataSourceFiles:
            return "Can upload or update data source files for a data schema belonging to the funding stream";
        default:
            return permission as string;
    }
}


