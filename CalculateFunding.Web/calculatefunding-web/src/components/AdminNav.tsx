import React from "react";
import { useSelector } from "react-redux";

import { IStoreState } from "../reducers/rootReducer";
import { FundingStreamPermissions } from "../types/FundingStreamPermissions";
import { TextLink } from "./TextLink";

export const AdminNav = React.memo(function () {
  const permissions: FundingStreamPermissions[] = useSelector(
    (state: IStoreState) => state.userState.fundingStreamPermissions
  );
  const canAdminister = permissions && permissions.some((fs) => fs.canAdministerFundingStream);

  return (
    <div className="govuk-grid-column-one-third">
      <nav className="right-align" aria-label="Admin">
        <span className="govuk-body-s govuk-!-margin-right-2">
          {canAdminister && <TextLink to="/Permissions/Admin">Admin</TextLink>}{" "}
          <TextLink to="/Permissions/MyPermissions">My user permissions</TextLink>
        </span>
      </nav>
    </div>
  );
});
