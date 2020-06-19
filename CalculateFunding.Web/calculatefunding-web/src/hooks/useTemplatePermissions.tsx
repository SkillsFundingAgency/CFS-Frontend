import { useMemo } from "react";
import { useSelector } from "react-redux";
import { AppState } from "../states/AppState";
import { FundingStreamPermissions } from "../types/FundingStreamPermissions";

export const useTemplatePermissions = (requiredPermissions: string[], requiredFundingStreams: string[] = []) => {
    let permissions: FundingStreamPermissions[] = useSelector((state: AppState) => state.userPermissions.fundingStreamPermissions);

    const canCreateTemplate = useMemo(() => {
        if (!permissions) {
            return false;
        }
        return permissions.some(p => p.canCreateTemplates &&
            (requiredFundingStreams.length === 0 || requiredFundingStreams.includes(p.fundingStreamId)));
    }, [permissions, requiredFundingStreams]);

    const canEditTemplate = useMemo(() => {
        if (!permissions) {
            return false;
        }
        return permissions.some(p => p.canEditTemplates &&
        (requiredFundingStreams.length === 0 || requiredFundingStreams.includes(p.fundingStreamId)));
    }, [permissions, requiredFundingStreams]);

    const canDeleteTemplate = useMemo(() => {
        if (!permissions) {
            return false;
        }
        return permissions.some(p => p.canDeleteTemplates &&
            (requiredFundingStreams.length === 0 || requiredFundingStreams.includes(p.fundingStreamId)));
    }, [permissions, requiredFundingStreams]);

    const canApproveTemplate = useMemo(() => {
        if (!permissions) {
            return false;
        }
        return permissions.some(p => p.canApproveTemplates &&
            (requiredFundingStreams.length === 0 || requiredFundingStreams.includes(p.fundingStreamId)));
    }, [permissions, requiredFundingStreams]);

    const missingPermissions = useMemo(() => {
        let missing: string[] = [];
        if (!canEditTemplate && requiredPermissions.includes("edit")) {
            missing.push("edit");
        }
        if (!canCreateTemplate && requiredPermissions.includes("create")) {
            missing.push("create");
        }
        if (!canDeleteTemplate && requiredPermissions.includes("delete")) {
            missing.push("delete");
        }
        if (!canApproveTemplate && requiredPermissions.includes("approve")) {
            missing.push("approve");
        }
        return missing;
    }, [canEditTemplate, canCreateTemplate, canDeleteTemplate, canApproveTemplate, requiredPermissions]);

    return {
        canCreateTemplate,
        canEditTemplate,
        canDeleteTemplate,
        canApproveTemplate,
        missingPermissions
    }
}