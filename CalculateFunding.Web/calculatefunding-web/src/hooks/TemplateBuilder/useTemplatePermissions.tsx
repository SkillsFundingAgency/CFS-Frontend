import { useMemo } from "react";
import { useSelector } from "react-redux";

import { IStoreState } from "../../reducers/rootReducer";
import { FundingStreamPermissions } from "../../types/FundingStreamPermissions";
import { TemplatePermissions } from "../../types/TemplateBuilderDefinitions";

export const useTemplatePermissions = (
  requiredPermissions: string[],
  requiredFundingStreams: string[] = []
) => {
  const permissions: FundingStreamPermissions[] = useSelector(
    (state: IStoreState) => state.userState.fundingStreamPermissions
  );

  const canCreateTemplate = useMemo(() => {
    if (!permissions) {
      return false;
    }
    return permissions.some(
      (p) =>
        p.canCreateTemplates &&
        (requiredFundingStreams.length === 0 || requiredFundingStreams.includes(p.fundingStreamId))
    );
  }, [permissions, requiredFundingStreams]);

  const canEditTemplate = useMemo(() => {
    if (!permissions) {
      return false;
    }
    return permissions.some(
      (p) =>
        p.canEditTemplates &&
        (requiredFundingStreams.length === 0 || requiredFundingStreams.includes(p.fundingStreamId))
    );
  }, [permissions, requiredFundingStreams]);

  const canApproveTemplate = useMemo(() => {
    if (!permissions) {
      return false;
    }
    return permissions.some(
      (p) =>
        p.canApproveTemplates &&
        (requiredFundingStreams.length === 0 || requiredFundingStreams.includes(p.fundingStreamId))
    );
  }, [permissions, requiredFundingStreams]);

  const missingPermissions = useMemo(() => {
    const missing: string[] = [];
    if (!canEditTemplate && requiredPermissions.includes(TemplatePermissions.Edit)) {
      missing.push(TemplatePermissions.Edit);
    }
    if (!canCreateTemplate && requiredPermissions.includes(TemplatePermissions.Create)) {
      missing.push(TemplatePermissions.Create);
    }
    if (!canApproveTemplate && requiredPermissions.includes(TemplatePermissions.Approve)) {
      missing.push(TemplatePermissions.Approve);
    }
    return missing;
  }, [canEditTemplate, canCreateTemplate, canApproveTemplate, requiredPermissions]);

  const fundingStreamPermissions = useMemo(() => {
    if (!permissions) {
      return;
    }
    const permissibleFundingStreams: { fundingStreamId: string; permission: string }[] = permissions
      .map((p) => {
        return [
          {
            fundingStreamId: p.fundingStreamId,
            permission: p.canCreateTemplates ? TemplatePermissions.Create : "",
          },
          {
            fundingStreamId: p.fundingStreamId,
            permission: p.canEditTemplates ? TemplatePermissions.Edit : "",
          },
          {
            fundingStreamId: p.fundingStreamId,
            permission: p.canApproveTemplates ? TemplatePermissions.Approve : "",
          },
        ].filter((f) => f.permission.length > 0);
      })
      .flat();

    return permissibleFundingStreams;
  }, [permissions, requiredPermissions, requiredFundingStreams]);

  return {
    canCreateTemplate,
    canEditTemplate,
    canApproveTemplate,
    missingPermissions,
    fundingStreamPermissions,
  };
};
