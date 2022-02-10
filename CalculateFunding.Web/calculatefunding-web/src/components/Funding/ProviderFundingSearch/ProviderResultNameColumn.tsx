import React from "react";
import { Link } from "react-router-dom";

import { PublishedProviderResult } from "../../../types/PublishedProvider/PublishedProviderSearchResults";
import { Tag, TagTypes } from "../../Tag";

export interface ProviderResultNameColumnProps {
  id: string;
  publishedProvider: PublishedProviderResult;
  enableSelection: boolean;
  isSelected: boolean;
  fundingOverviewUrl: string;
  handleItemSelectionToggle: any;
}

export const ProviderResultNameColumn = (props: ProviderResultNameColumnProps) => {
  const provider = props.publishedProvider;

  if (props.publishedProvider.hasErrors) {
    return (
      <td className="govuk-table__cell govuk-!-padding-bottom-0" colSpan={2}>
        <div className="govuk-checkboxes govuk-checkboxes--small">
          <label className="govuk-label govuk-form-group--error" htmlFor={props.id}>
            <Link
              id={props.id}
              to={props.fundingOverviewUrl}
              className="govuk-link govuk-link--no-visited-state"
            >
              {provider.providerName}
            </Link>
            <div className={"govuk-!-margin-top-2 govuk-!-margin-bottom-2"}>
              <span className={"govuk-body-s"}>
                <span className={"govuk-!-font-weight-bold"}>UKPRN:</span>
                {provider.ukprn}
              </span>
            </div>
            {provider.isIndicative ? (
              <span className={"float-right"}>
                <Tag text={"indicative"} type={TagTypes.grey} />
              </span>
            ) : (
              ""
            )}
            {provider.errors.map((err, index) => (
              <span key={`err-${props.id}-${index}`} className="govuk-error-message govuk-!-margin-top-2">
                <span className="govuk-visually-hidden">Error:</span>
                {err}
              </span>
            ))}
          </label>
        </div>
      </td>
    );
  }
  if (props.enableSelection) {
    return (
      <td className="govuk-table__cell govuk-!-padding-bottom-0">
        <div className="govuk-checkboxes__item">
          <input
            className="govuk-checkboxes__input provider-checked"
            id={props.id}
            type="checkbox"
            value={provider.publishedProviderVersionId}
            checked={props.isSelected}
            onChange={props.handleItemSelectionToggle}
          />
          <label className="govuk-label govuk-checkboxes__label" htmlFor={props.id}>
            <Link to={props.fundingOverviewUrl} className="govuk-link govuk-link--no-visited-state">
              {provider.providerName}
            </Link>
            <div className={"govuk-!-margin-top-2 govuk-!-margin-bottom-2"}>
              <span className={"govuk-body-s"}>
                <span className={"govuk-!-font-weight-bold"}>UKPRN:</span>
                {provider.ukprn}
              </span>
            </div>
            {provider.isIndicative ? (
              <span className={"float-right"}>
                <Tag text={"indicative"} type={TagTypes.grey} />
              </span>
            ) : (
              ""
            )}
          </label>
        </div>
      </td>
    );
  } else {
    return (
      <td className="govuk-table__cell govuk-!-padding-bottom-0">
        <Link id={props.id} to={props.fundingOverviewUrl} className="govuk-link govuk-link--no-visited-state">
          {provider.providerName}
        </Link>
        <div className={"govuk-!-margin-top-2 govuk-!-margin-bottom-2"}>
          <span className={"govuk-body-s"}>
            <span className={"govuk-!-font-weight-bold"}>UKPRN:</span>
            {provider.ukprn}
          </span>
        </div>
        {provider.isIndicative ? (
          <span className={"float-right"}>
            <Tag text={"indicative"} type={TagTypes.grey} />
          </span>
        ) : (
          ""
        )}
      </td>
    );
  }
};
