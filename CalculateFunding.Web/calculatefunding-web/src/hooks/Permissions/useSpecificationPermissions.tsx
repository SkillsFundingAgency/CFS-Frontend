import {useMemo} from "react";
import {getUserPermissionsService} from "../../services/userService";
import {useQuery, UseQueryOptions} from "react-query";
import { AxiosError } from "axios";
import {EffectiveSpecificationPermission} from "../../types/EffectiveSpecificationPermission";
import {milliseconds} from "../../helpers/TimeInMs";

export enum Permissions {
    Create = "Create",
    Edit = "Edit",
    EditCalculations = "Edit Calculations",
    ApproveCalculations = "Approve Calculations",
    ApproveAllCalculations = "Approve All Calculations",
    ChooseFunding = "Choose Funding",
    CreateAdditionalCalculations = "Create Additional Calculations",
    CanApplyCustomProfilePattern = "Can Edit Funding Line Profiles",
    MapDatasets = "Map Datasets",
    Release = "Release",
    Refresh = "Refresh",
    Approve = "Approve"
}

export enum SpecificationPermissions {
    Create = "Create",
    Edit = "Edit",
    EditCalculations = "Edit Calculations",
    ApproveCalculations = "Approve Calculations",
    ApproveAllCalculations = "Approve All Calculations",
    ChooseFunding = "Choose Funding",
    CreateAdditionalCalculations = "Create Additional Calculations",
    CanApplyCustomProfilePattern = "Can Edit Funding Line Profiles",
    MapDatasets = "Map Datasets",
    Release = "Release",
    Refresh = "Refresh",
    Approve = "Approve"
}

export interface SpecificationPermissionsResult {
    isCheckingForPermissions: boolean,
    isPermissionsFetched: boolean,
    canCreateSpecification: boolean | undefined,
    canEditSpecification: boolean | undefined,
    canApproveFunding: boolean | undefined,
    canRefreshFunding: boolean | undefined,
    canReleaseFunding: boolean | undefined,
    canMapDatasets: boolean | undefined,
    canCreateAdditionalCalculation: boolean | undefined,
    canEditCalculation: boolean | undefined,
    canApproveCalculation: boolean | undefined,
    canApproveAllCalculations: boolean | undefined,
    canApplyCustomProfilePattern: boolean | undefined,
    canChooseFunding: boolean | undefined,
    hasMissingPermissions: boolean,
    missingPermissions: string[]
}

export const useSpecificationPermissions = (
    specificationId: string, 
    requiredPermissions: SpecificationPermissions[],
    queryOptions: UseQueryOptions<EffectiveSpecificationPermission, AxiosError> = {
        cacheTime: milliseconds.OneHour, 
        staleTime: milliseconds.OneHour, 
        enabled: (specificationId && specificationId.length > 0) === true, 
        refetchOnWindowFocus: false
    }): SpecificationPermissionsResult => {

    const {data: permissions, isLoading, isFetched} =
        useQuery<EffectiveSpecificationPermission, AxiosError>(
            `specification-${specificationId}-permissions`,
            async () => (await getUserPermissionsService(specificationId)).data,
            queryOptions);

    const canCreateSpecification = useMemo(() => {
        return permissions && permissions.canCreateSpecification;
    }, [permissions]);

    const canEditSpecification = useMemo(() => {
        return permissions && permissions.canEditSpecification;
    }, [permissions]);

    const canEditCalculation = useMemo(() => {
        return permissions && permissions.canEditCalculations;
    }, [permissions]);

    const canApproveCalculation = useMemo(() => {
        return permissions && (permissions.canApproveAnyCalculations || permissions.canApproveCalculations);
    }, [permissions]);

    const canApproveAllCalculations = useMemo(() => {
        return permissions && (permissions.canApproveAllCalculations && permissions.canApproveCalculations && permissions.canApproveAnyCalculations);
    }, [permissions]);

    const canChooseFunding = useMemo(() => {
        return permissions && (permissions.canChooseFunding);
    }, [permissions]);

    const canRefreshFunding = useMemo(() => {
        return permissions && permissions.canRefreshFunding;
    }, [permissions]);

    const canApproveFunding = useMemo(() => {
        return permissions && permissions.canApproveFunding;
    }, [permissions]);

    const canReleaseFunding = useMemo(() => {
        return permissions && permissions.canReleaseFunding;
    }, [permissions]);
    
    const canMapDatasets = useMemo(() => {
        return permissions && permissions.canMapDatasets;
    }, [permissions]);
    
    const canCreateAdditionalCalculations = useMemo(() => {
        return permissions && permissions.canEditCalculations;
    }, [permissions]);

    const canApplyCustomProfilePattern = useMemo(() => {
        return permissions && permissions.canApplyCustomProfilePattern;
    }, [permissions]);


    const missingPermissions = useMemo(() => {
        const missing: string[] = [];
        if (!canEditSpecification && requiredPermissions.includes(SpecificationPermissions.Edit)) {
            missing.push(SpecificationPermissions.Edit);
        }
        if (!canCreateSpecification && requiredPermissions.includes(SpecificationPermissions.Create)) {
            missing.push(SpecificationPermissions.Create);
        }
        if (!canRefreshFunding && requiredPermissions.includes(SpecificationPermissions.Refresh)) {
            missing.push(SpecificationPermissions.Refresh);
        }
        if (!canReleaseFunding && requiredPermissions.includes(SpecificationPermissions.Release)) {
            missing.push(SpecificationPermissions.Release);
        }
        if (!canApproveFunding && requiredPermissions.includes(SpecificationPermissions.Approve)) {
            missing.push(SpecificationPermissions.Approve);
        }
        if (!canMapDatasets && requiredPermissions.includes(SpecificationPermissions.MapDatasets)) {
            missing.push(SpecificationPermissions.MapDatasets);
        }
        if (!canEditCalculation && requiredPermissions.includes(SpecificationPermissions.EditCalculations)) {
            missing.push(SpecificationPermissions.EditCalculations);
        }
        if (!canApproveCalculation && requiredPermissions.includes(SpecificationPermissions.ApproveCalculations)) {
            missing.push(SpecificationPermissions.ApproveCalculations);
        }
        if (!canApproveAllCalculations && requiredPermissions.includes(SpecificationPermissions.ApproveAllCalculations)) {
            missing.push(SpecificationPermissions.ApproveAllCalculations);
        }
        if (!canChooseFunding && requiredPermissions.includes(SpecificationPermissions.ChooseFunding)) {
            missing.push(SpecificationPermissions.ChooseFunding);
        }
        if (!canCreateAdditionalCalculations && requiredPermissions.includes(SpecificationPermissions.CreateAdditionalCalculations)) {
            missing.push(SpecificationPermissions.CreateAdditionalCalculations);
        }
        if (!canApplyCustomProfilePattern && requiredPermissions.includes(SpecificationPermissions.CanApplyCustomProfilePattern)) {
            missing.push(SpecificationPermissions.CanApplyCustomProfilePattern);
        }
        return missing;
    }, [canCreateSpecification, canEditSpecification, canRefreshFunding, canApproveFunding, canReleaseFunding, canApplyCustomProfilePattern,
        canMapDatasets, requiredPermissions, canEditCalculation, canApproveCalculation, canApproveAllCalculations, canChooseFunding]);

    return {
        isCheckingForPermissions: queryOptions.enabled ? isLoading : false,
        isPermissionsFetched: queryOptions.enabled ? isFetched: false,
        canCreateSpecification,
        canEditSpecification,
        canApproveFunding,
        canRefreshFunding,
        canReleaseFunding,
        canMapDatasets,
        canApplyCustomProfilePattern,
        canCreateAdditionalCalculation: canCreateAdditionalCalculations,
        canEditCalculation,
        canApproveCalculation,
        canApproveAllCalculations,
        canChooseFunding,
        hasMissingPermissions: queryOptions.enabled ? missingPermissions && missingPermissions.length > 0: false,
        missingPermissions
    }
};