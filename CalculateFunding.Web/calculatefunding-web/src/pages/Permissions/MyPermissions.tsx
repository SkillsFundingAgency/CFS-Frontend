import React, { useState } from "react";
import { useSelector } from "react-redux";

import { Main } from "../../components/Main";
import { MultipleErrorSummary } from "../../components/MultipleErrorSummary";
import { Title } from "../../components/Title";
import { WarningText } from "../../components/WarningText";
import { getPermissionDescription } from "../../helpers/permissionsHelper";
import { useFundingStreamPermissions } from "../../hooks/Permissions/useFundingStreamPermissions";
import { useErrors } from "../../hooks/useErrors";
import { IStoreState } from "../../reducers/rootReducer";
import { getAdminUsersForFundingStream } from "../../services/userService";
import { FundingStreamPermissions } from "../../types/FundingStreamPermissions";
import { Permission } from "../../types/Permission";
import { Section } from "../../types/Sections";

export function MyPermissions() {
  const permissions: FundingStreamPermissions[] = useSelector(
    (state: IStoreState) => state.userState.fundingStreamPermissions
  );
  const pageTitle = (document.title = "My user permissions");
  const [currentFundingStream, setCurrentFundingStreamId] = useState<FundingStreamPermissions>();
  const [adminUsers, setAdminUsers] = useState<string[] | undefined>(undefined);
  const permitted: Permission[] = useFundingStreamPermissions(currentFundingStream);
  const permissionsToShow: Permission[] = Object.values(Permission);
  const { errors, addError } = useErrors();

  function onFundingStreamChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const fundingStreamId = e.target.value;
    loadFundingStreamAdmins(fundingStreamId);
    setCurrentFundingStreamId(permissions.find((p) => p.fundingStreamId === fundingStreamId));
  }

  function loadFundingStreamAdmins(fundingStreamId: string) {
    getAdminUsersForFundingStream(fundingStreamId)
      .then((result) =>
        setAdminUsers(
          result.data ? result.data.map((u) => u.username.trim()).filter((u) => u !== "") : undefined
        )
      )
      .catch(() =>
        addError({
          error: `Unable to retrieve users for funding stream ${fundingStreamId}`,
        })
      );
  }

  const RequestExtraPermission = () => {
    return (
      <div className="govuk-grid-row govuk-!-margin-top-9">
        <div className="govuk-grid-column-full">
          <div className="form-group">
            <h2 className="govuk-heading-l">Requesting Permissions</h2>
            <p className="govuk-body">
              An administrator for your funding stream can provide you with permissions. Contact a system
              administrator if there are none listed.
            </p>
            {adminUsers && (
              <>
                <p className="govuk-body">
                  Administrators for the {currentFundingStream?.fundingStreamName} funding stream are:
                </p>
                <ul className="govuk-list govuk-list--bullet">
                  {adminUsers.map((user, index) => (
                    <li key={index}>{user}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Main location={Section.Home}>
      <Title
        title={pageTitle}
        description="View my user permissions for a funding stream"
        includeBackLink={true}
      />

      <MultipleErrorSummary errors={errors} />

      {permissions && permissions.length === 0 && (
        <WarningText
          text="You have read only access for all funding streams"
          className="govuk-!-margin-top-4"
        />
      )}
      {permissions && permissions.length > 0 && (
        <section className="govuk-grid-row govuk-!-margin-top-2">
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-form-group">
              <label id="funding-stream-hint" className="govuk-label" htmlFor="funding-stream">
                Select funding stream
              </label>
              <select
                id="funding-stream"
                name="funding-stream"
                className="govuk-select"
                onChange={onFundingStreamChange}
                aria-describedby="funding-stream-hint"
                aria-label="select funding stream"
              >
                <option> </option>
                {permissions
                  .sort((a, b) =>
                    (a.fundingStreamName ? a.fundingStreamName : a.fundingStreamId).localeCompare(
                      b.fundingStreamName ? b.fundingStreamName : b.fundingStreamId
                    )
                  )
                  .map((p) => (
                    <option key={p.fundingStreamId} value={p.fundingStreamId}>
                      {p.fundingStreamName}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </section>
      )}
      {currentFundingStream && (
        <section id="permissions" className="">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
              <h2 className="govuk-heading-s govuk-!-margin-top-5">
                You have these permissions for the {currentFundingStream.fundingStreamName} funding stream in
                the Calculate Funding Service
              </h2>
              <table className="govuk-table govuk-!-margin-top-5">
                <caption className="govuk-table__caption">
                  <h1>Calculate Funding Service permissions</h1>
                </caption>
                <thead className="govuk-table__head">
                  <tr className="govuk-table__row">
                    <th scope="col" className="govuk-table__header ">
                      Permission
                    </th>
                    <th scope="col" className="govuk-table__header">
                      My permissions
                    </th>
                    <th scope="col" className="govuk-table__header govuk-!-width-one-half">
                      Permission description
                    </th>
                  </tr>
                </thead>
                <tbody className="govuk-table__body">
                  {permissionsToShow
                    .sort((a, b) => a.localeCompare(b))
                    .map((p, index) => (
                      <tr key={index} className="govuk-table__row">
                        <th scope="row" className="govuk-table__header">
                          {p}
                        </th>
                        {permitted.includes(p) ? (
                          <td className="govuk-table__cell center-align">
                            <span className="govuk-visually-hidden">Yes</span>&#x2714;
                          </td>
                        ) : (
                          <td className="govuk-table__cell permissionsIcon">
                            <span className="govuk-visually-hidden">No</span>
                          </td>
                        )}
                        <td className="govuk-table__cell">{getPermissionDescription(p)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      <RequestExtraPermission />
    </Main>
  );
}
