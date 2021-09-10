import React from "react";
import { Link } from "react-router-dom";

export function MergeSummary(props: {
  existingRowsAmended: number;
  additionalRowsCreated: number;
  dataSchemaName: string;
  dataSourceVersion: number;
  dataSource: string;
  hidden: boolean;
}) {
  return (
    <div hidden={props.hidden}>
      <div className="govuk-grid-row ">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-panel govuk-panel--confirmation ">
            <h1 className="govuk-panel__title">Merge successful</h1>
          </div>
        </div>
      </div>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <dl className="govuk-summary-list govuk-summary-list--no-border">
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Data source</dt>
              <dd className="govuk-summary-list__value" id="data-source">
                {props.dataSource}
              </dd>
            </div>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Data source version</dt>
              <dd className="govuk-summary-list__value" id="data-source-version">
                {props.dataSourceVersion}
              </dd>
            </div>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Data schema</dt>
              <dd className="govuk-summary-list__value" id="data-schema">
                {props.dataSchemaName}
              </dd>
            </div>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Additional rows created</dt>
              <dd id="additional-rows-created" className="govuk-summary-list__value">
                {props.additionalRowsCreated}
              </dd>
            </div>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Existing rows amended</dt>
              <dd className="govuk-summary-list__value" id="existing-rows-amended">
                {props.existingRowsAmended}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <Link to={"/Datasets/ManageDataSourceFiles"} className="govuk-button">
        Continue
      </Link>
    </div>
  );
}
