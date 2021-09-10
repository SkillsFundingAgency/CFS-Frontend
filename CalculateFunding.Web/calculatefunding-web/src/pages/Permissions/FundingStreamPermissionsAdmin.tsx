import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { ConfirmationPanel } from "../../components/ConfirmationPanel";
import { LoadingFieldStatus } from "../../components/LoadingFieldStatus";
import { Main } from "../../components/Main";
import { MultipleErrorSummary } from "../../components/MultipleErrorSummary";
import { Title } from "../../components/Title";
import { WarningText } from "../../components/WarningText";
import { useErrors } from "../../hooks/useErrors";
import { IStoreState } from "../../reducers/rootReducer";
import * as userService from "../../services/userService";
import { FundingStreamPermissions } from "../../types/FundingStreamPermissions";
import { ReportOnUsersWithFundingStreamPermissionsModel } from "../../types/ReportOnUsersWithFundingStreamPermissionsModel";
import { Section } from "../../types/Sections";
import { FundingStream } from "../../types/viewFundingTypes";

export function FundingStreamPermissionsAdmin() {
  const pageTitle = (document.title = "Funding stream permissions");
  const permissions: FundingStreamPermissions[] = useSelector(
    (state: IStoreState) => state.userState.fundingStreamPermissions
  );
  const fundingStreams: FundingStream[] = useMemo(
    () =>
      permissions &&
      permissions
        .filter((fs) => fs.canAdministerFundingStream)
        .map(
          (fs) =>
            ({
              id: fs.fundingStreamId,
              name: fs.fundingStreamName,
            } as FundingStream)
        ),
    [permissions]
  );
  const { errors, addError, clearErrorMessages } = useErrors();
  const [selectedFundingStream, setSelectedFundingStream] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [report, setReport] = useState<ReportOnUsersWithFundingStreamPermissionsModel>();

  async function onSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    clearErrorMessages();
    setSelectedFundingStream(e.target.value);
    setReport(undefined);
    setLoading(false);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    clearErrorMessages();

    if (!selectedFundingStream || selectedFundingStream.length === 0) {
      addError({ error: "Select a funding stream" });
    } else {
      try {
        setLoading(true);
        const response = await userService.getReportOnUsersByFundingStream(selectedFundingStream);
        setReport(response.data);
      } catch (e: any) {
        addError({ error: e, description: "Unexpected server error" });
      }
      setLoading(false);
    }
  }

  return (
    <Main location={Section.Home}>
      <MultipleErrorSummary errors={errors} />

      <Title
        title={pageTitle}
        description="Download all user permissions for a funding stream"
        includeBackLink={true}
      />
      {permissions && fundingStreams && fundingStreams.length === 0 && (
        <WarningText text="You don't have any admin permissions" className="govuk-!-margin-top-4" />
      )}

      <section className="govuk-grid-row govuk-!-margin-top-2">
        <div className="govuk-grid-column-two-thirds">
          <form
            id="download-form"
            className="form"
            onSubmit={onSubmit}
            noValidate={true}
            data-validate="permissions"
          >
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="fundingStream">
                Select funding stream to download
              </label>
              <select id="fundingStream" onChange={onSelect} name="fundingStream" className="govuk-select">
                <option> </option>
                {fundingStreams
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((fs) => (
                    <option value={fs.id} key={fs.id}>
                      {fs.name}
                    </option>
                  ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !!report}
              className="govuk-button govuk-!-margin-right-1"
            >
              Download
            </button>

            {loading && (
              <LoadingFieldStatus
                title={"Generating report of users with permissions against this funding stream"}
              />
            )}
            {!loading && report?.url && (
              <ConfirmationPanel title="Report generated successfully">
                <a href={report.url} className="govuk-panel__link" target="_self">
                  Download report
                </a>
              </ConfirmationPanel>
            )}
          </form>
        </div>
      </section>
    </Main>
  );
}
