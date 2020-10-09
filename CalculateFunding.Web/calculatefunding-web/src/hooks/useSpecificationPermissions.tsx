import {useMemo} from "react";
import {getUserPermissionsService} from "../services/userService";
import {useQuery} from "react-query";

export enum SpecificationPermissions {
    Create = "Create",
    Edit = "Edit",
    MapDatasets = "Map Datasets",
    Release = "Release",
    Refresh = "Refresh",
    Approve = "Approve"
}

export const useSpecificationPermissions = (specificationId: string, requiredPermissions: SpecificationPermissions[]) => {
    const isEnabled = specificationId && specificationId.length > 0;
    const oneHour = 1000 * 60 * 60;

    const {data: permissions, isLoading, isFetched} =
        useQuery(
            `specification-${specificationId}-permissions`,
            () => getUserPermissionsService(specificationId)
                .then((response) => {
                    return response.data;
                }),
            {cacheTime: oneHour, staleTime: oneHour, enabled: isEnabled, refetchOnWindowFocus: false});

    const canCreateSpecification = useMemo(() => {
        return permissions && permissions.canCreateSpecification;
    }, [permissions]);

    const canEditSpecification = useMemo(() => {
        return permissions && permissions.canEditSpecification;
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


    const missingPermissions = useMemo(() => {
        let missing: string[] = [];
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
        return missing;
    }, [canCreateSpecification, canEditSpecification, canRefreshFunding, canApproveFunding, canReleaseFunding, canMapDatasets, requiredPermissions]);

    return {
        isCheckingForPermissions: isEnabled ?isLoading : false,
        isPermissionsFetched: isEnabled ?isFetched: false,
        canCreateSpecification,
        canEditSpecification,
        canApproveFunding,
        canRefreshFunding,
        canReleaseFunding,
        canMapDatasets,
        hasMissingPermissions: isEnabled ? missingPermissions && missingPermissions.length > 0: false,
        missingPermissions
    }
};